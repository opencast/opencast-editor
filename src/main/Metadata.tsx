import React, { useEffect } from "react";

import { css } from "@emotion/react";
import { BREAKPOINTS, calendarStyle, selectFieldStyle, titleStyle, titleStyleBold } from "../cssStyles";

import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchMetadata,
  selectCatalogs,
  Catalog,
  MetadataField,
  setFieldValue,
  selectGetError,
  selectGetStatus,
  setFieldReadonly,
} from "../redux/metadataSlice";

import { Form, Field, FieldInputProps } from "react-final-form";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

import { useTranslation } from "react-i18next";
import { DateTime as LuxonDateTime } from "luxon";

import { configureFieldsAttributes, settings } from "../config";
import { useTheme } from "../themes";
import { ThemeProvider } from "@mui/material/styles";
import { cloneDeep } from "lodash";
import { ParseKeys } from "i18next";
import { ErrorBox } from "@opencast/appkit";
import { screenWidthAtMost } from "@opencast/appkit";

/**
 * Creates a Metadata form
 *
 * Takes data from a redux slice and throws it into a react-final-form.
 * When submitting, the state in the redux slice gets updated
 *
 * If something doesn"t work, main places of interest are the submit function
 * and the initialValues function
 */
const Metadata: React.FC = () => {

  const { t, i18n } = useTranslation();

  // Init redux variables
  const dispatch = useAppDispatch();
  const catalogs = useAppSelector(selectCatalogs);
  const getStatus = useAppSelector(selectGetStatus);
  const getError = useAppSelector(selectGetError);
  const theme = useTheme();

  // Try to fetch URL from external API
  useEffect(() => {
    if (getStatus === "idle") {
      dispatch(fetchMetadata());
    }
  }, [getStatus, dispatch]);

  // Overwrite readonly property of fields based on config settings
  useEffect(() => {
    if (getStatus === "success") {
      for (let catalogIndex = 0; catalogIndex < catalogs.length; catalogIndex++) {
        if (settings.metadata.configureFields) {
          const configureFields = settings.metadata.configureFields;
          const catalog = catalogs[catalogIndex];

          if (catalog.title in configureFields) {
            if (Object.keys(configureFields[catalog.title]).length > 0) {
              const configureFieldsCatalog = configureFields[catalog.title];

              for (let fieldIndex = 0; fieldIndex < catalog.fields.length; fieldIndex++) {
                if (catalog.fields[fieldIndex].id in configureFieldsCatalog) {
                  if ("readonly" in configureFieldsCatalog[catalog.fields[fieldIndex].id]) {
                    dispatch(setFieldReadonly({
                      catalogIndex: catalogIndex, fieldIndex: fieldIndex,
                      value: configureFieldsCatalog[catalog.fields[fieldIndex].id].readonly,
                    }));
                  }
                }
              }
            } else {
              return undefined;
            }
          }
        }
      }
    }
  }, [getStatus, catalogs, dispatch]);

  /**
   * CSS
   */

  const metadataStyle = css({
    padding: "20px",
    marginLeft: "auto",
    marginRight: "auto",
    minWidth: "50%",
    display: "grid",
    [screenWidthAtMost(1550)]: {
      minWidth: "70%",
    },
    [screenWidthAtMost(BREAKPOINTS.medium)]: {
      minWidth: "90%",
    },
  });

  const catalogStyle = css({
    background: `${theme.menu_background}`,
    borderRadius: "5px",
    boxShadow: `${theme.boxShadow_tiles}`,
    marginTop: "24px",
    boxSizing: "border-box",
    padding: "10px",
  });

  const fieldStyle = css({
    display: "flex",
    flexFlow: "column nowrap",
    lineHeight: "2em",
    margin: "10px",
  });

  const fieldLabelStyle = css({
    width: "110px",
    fontSize: "1em",
    fontWeight: "bold",
    color: `${theme.text}`,
    lineHeight: "32px",
    display: "flex",
    flexDirection: "row",
  });

  const fieldLabelRequiredStyle = css({
    color: `${theme.metadata_highlight}`,
  });

  const fieldTypeStyle = (isReadOnly: boolean) => {
    return css({
      fontSize: "1em",
      borderRadius: "5px",
      boxShadow: isReadOnly ? "0 0 0px rgba(0, 0, 0, 0.3)" : "0 0 1px rgba(0, 0, 0, 0.3)",
      ...(isReadOnly && { color: `${theme.text}` }),
      color: `${theme.text}`,
      outline: isReadOnly ? "0px solid transparent" : `${theme.element_outline}`,
      "&:hover": {
        borderColor: isReadOnly ? undefined : theme.metadata_highlight,
      },
      "&:focus": {
        borderColor: isReadOnly ? undefined : theme.metadata_highlight,
      },
    });
  };

  const inputFieldTypeStyle = (isReadOnly: boolean) => {
    return (
      css({
        padding: "10px 10px",
        border: "1px solid #ccc",
        background: isReadOnly ? `${theme.background}` : `${theme.element_bg}`,
        opacity: isReadOnly ? "0.6" : "1",
        resize: "vertical",
      })
    );
  };

  const validateStyle = (isError: boolean) => {
    return css({
      lineHeight: "32px",
      marginLeft: "10px",
      ...(isError && { color: `${theme.error}` }),
      fontWeight: "bold",
    });
  };

  // const buttonContainerStyle = css({
  //   display: "flex",
  //   flexFlow: "row nowrap",
  //   justifyContent: "space-around",
  //   marginTop: "25px",
  // })

  // // TODO: Rework all div buttons so the ":enabled" pseudo-class does not screw them over
  // const basicButtonStyleCOPY = css({
  //   borderRadius: "10px",
  //   cursor: "pointer",
  //   // Animation
  //   transitionDuration: "0.3s",
  //   transitionProperty: "transform",
  //   "&:hover:enabled": {
  //     transform: "scale(1.1)",
  //   },
  //   "&:focus:enabled": {
  //     transform: "scale(1.1)",
  //   },
  //   "&:active:enabled": {
  //     transform: "scale(0.9)",
  //   },
  //   // Flex position child elements
  //   display: "flex",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   gap: "10px",
  //   textAlign: "center" as const,
  // });

  // const submitButtonStyle = css({
  //   background: "snow",
  //   border: "1px solid #ccc",

  //   "&[disabled]": {
  //     opacity: "0.6",
  //     cursor: "not-allowed",
  //   },
  // })

  /**
   * Form Callbacks - Other
   */

  /**
    * Recursively recreates nested array structures for form initalValues
    * @param library
    * @param input
    * @param output
    */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const helperHandleArrays = (library: any[] | null, input: string, output: any[]) => {
    // If the value is hid inside an array, we need to extract it
    if (Array.isArray(input)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input.forEach((subArray: any) => {
        output.push(helperHandleArrays(library, subArray, output));
      });
    }

    // Find react-select equivalent for inital value
    return library?.find(el => el.submitValue === input);
  };

  /**
   * Returns a data structure to initialize the form fields with
   * @param catalogs
   */
  const getInitialValues = (catalogs: Catalog[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initValues: { [n: string]: any; } = {};

    catalogs.forEach((catalog: Catalog, catalogIndex: number) => {
      initValues["catalog" + catalogIndex] = {};
      catalog.fields.forEach((field: MetadataField) => {
        initValues["catalog" + catalogIndex][field.id] = field.value;

        // Handle initial values for select fields differently
        // Since react-select creates different values
        if (field.collection) {
          const library = generateReactSelectLibrary(field);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let searchValue: any = field.value;

          if (Array.isArray(searchValue)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result: any[] = [];
            helperHandleArrays(library, field.value, result);
            searchValue = result;
          } else {
            searchValue = library?.find(el => el.submitValue === searchValue);
          }

          initValues["catalog" + catalogIndex][field.id] = searchValue;
        }
      });
    });

    return initValues;
  };

  /**
   * Form Callbacks - Validation
   */

  /**
   * Validator for required fields
   * @param value
   */
  const required = (value: unknown) => {
    let val = value;

    if (value && typeof value === "object" && "submitValue" in value) {
      val = value.submitValue;
    }

    if (value && Array.isArray(value) && value.length === 0) {
      val = false;
    }

    return val ? undefined : t("metadata.validation.required");
  };

  /**
   * Validator for the duration field
   * @param value
   */
  const duration = (value: string) => {
    const re = /^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]$/;
    return re.test(value) ? undefined : t("metadata.validation.duration-format");
  };

  /**
   * Validator for the date time fields
   * @param date
   */
  const dateTimeValidator = (date: Date | string) => {
    // Empty field is valid value in Opencast
    if (!date) {
      return undefined;
    }

    let dt = undefined;
    if (Object.prototype.toString.call(date) === "[object Date]") {
      dt = LuxonDateTime.fromJSDate(date as Date);
    }
    if (typeof date === "string") {
      dt = LuxonDateTime.fromISO(date);
    }

    if (dt) {
      return dt.isValid ? undefined : t("metadata.validation.datetime");
    }
    return t("metadata.validation.datetime");
  };

  // // Function that combines multiple validation functions. Needs to be made typescript conform
  // @ts-expect-error: This is copy-pasted from the non-typescript documentation of react-final-form
  const composeValidators = (...validators) => value =>
    validators.reduce((error, validator) => error || validator(value), undefined);

  /**
   * Returns the desired combination of validators for a given field
   * @param field
   */
  const getValidators = (field: MetadataField) => {
    const validators = [];
    if (field.required) {
      validators.push(required);
    }
    if (field.id === "duration") {
      validators.push(duration);
    }
    if (field.type === "date" || field.type === "time") {
      validators.push(dateTimeValidator);
    }

    return composeValidators(...validators);
  };

  /**
   * Form Callbacks - Submitting
   */

  /**
    * Sends a single value to the corresponding field in redux.
    * This kinda breaks the form workflow, since we do not use the submit callback
    * of the form class anymore.
    * @param value value for the field
    * @param fieldId String of the form "catalog{catalogIndex}.name"
    */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitSingleField = (value: any, fieldId: string) => {
    const catalogIndexString = fieldId.substring(
      fieldId.indexOf("g") + 1,
      fieldId.indexOf("."),
    );
    const fieldName = fieldId.substring(
      fieldId.indexOf(".") + 1,
      fieldId.length,
    );
    const catalogIndex = parseInt(catalogIndexString);

    // Find the corresponding field index in the redux catalog
    for (let fieldIndex = 0; fieldIndex < catalogs[catalogIndex].fields.length; fieldIndex++) {
      if (catalogs[catalogIndex].fields[fieldIndex].id === fieldName) {
        // Update the field in the redux catalog
        dispatch(setFieldValue({
          catalogIndex: catalogIndex, fieldIndex: fieldIndex,
          value: parseValue(catalogs[catalogIndex].fields[fieldIndex], value),
        }));
        break;
      }
    }
  };

  /**
   * Executes given blur callback while also sending the value of the current field to redux
   * @param e
   * @param input
   */
  const blurWithSubmit = (
    e: React.FocusEvent<HTMLInputElement, Element> | React.FocusEvent<HTMLTextAreaElement, Element>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: any,
  ) => {
    input.onBlur(e);
    submitSingleField(input.value, input.name);
  };

  /**
   * Helper function for onSubmit
   * Corrects formatting for certain form values
   * @param field
   * @param value
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseValue = (field: MetadataField | null, value: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let returnValue: any = value;

    // Parse values out react-multi-select and put them in an array
    if (Array.isArray(value)) {
      returnValue = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value.forEach((subValue: any) => {
        returnValue.push(parseValue(null, subValue));  // Pass field as null to avoid each value into an array later on
      });
    }

    // If the value is hidden an object due to react-select, extract it
    if (typeof value === "object" && value !== null && Object.prototype.hasOwnProperty.call(value, "submitValue")) {
      returnValue = value.submitValue;
    } else if (typeof value === "object" && value !== null && value.__isNew__) {
      returnValue = value.value;
    }

    // For these fields, the value needs to be inside an array
    if (field && !Array.isArray(value) && (field.id === "creator" || field.id === "contributor")) {
      returnValue = [returnValue];
    }

    // For these fields, the value needs to be inside an array
    if (field && (field.type === "date" || field.type === "time") &&
      Object.prototype.toString.call(returnValue) === "[object Date]") {
      // If invalid date
      if ((isNaN(returnValue.getTime()))) {
        // Do nothing
      } else {
        returnValue = returnValue.toJSON();
      }
    } else if (field && (field.type === "date" || field.type === "time") && typeof returnValue === "string") {
      if (returnValue !== "") { // Empty string is allowed
        returnValue = new Date(returnValue).toJSON();
      }
    }

    return returnValue;
  };

  /**
   * Callback for when the form is submitted
   * Saves values in redux state
   * @param values
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (values: { [x: string]: { [x: string]: any; }; }) => {
    // For each submitted value, get the catalog it belongs to
    Object.keys(values).forEach((formCatalogName: string) => {
      const catalogIndex = parseInt(formCatalogName.replace("catalog", ""));

      // For each field in the submitted values
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.keys(values[formCatalogName]).forEach((formFieldName: any) => {
        // Find the corresponding field index in the redux catalog
        for (let fieldIndex = 0; fieldIndex < catalogs[catalogIndex].fields.length; fieldIndex++) {
          if (catalogs[catalogIndex].fields[fieldIndex].id === formFieldName) {
            // Update the field in the redux catalog
            dispatch(setFieldValue({
              catalogIndex: catalogIndex, fieldIndex: fieldIndex,
              value: parseValue(catalogs[catalogIndex].fields[fieldIndex], values[formCatalogName][formFieldName]),
            }));
            break;
          }
        }
      });

    });
  };

  /**
   * Form - Rendering
   */

  /**
   * Transforms field values and labels into an array of objects
   * that can be parsed by react-select
   * @param field
   */
  const generateReactSelectLibrary = (field: MetadataField) => {
    if (field.collection) {
      // For whatever reason react-select uses "value" as their key, which is not at all confusing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const library: [{ value: any, label: string, submitValue: any; }] =
        [{ value: "", label: "No value", submitValue: "" }];
      Object.entries(field.collection).forEach(([key, value]) => {
        // // Parse License
        // let [err, result] = safeJsonParse(key)
        // if (!err) {
        //   console.log(result)
        // }

        // Parse Label
        let descLabel = null;
        if (i18n.exists(`metadata.${field.id}`)) {
          descLabel = t(`metadata.${field.id}.${key.replaceAll(".", "-")}` as ParseKeys);

          if (field.id === "license") {
            descLabel = t(`metadata.${field.id}.${JSON.parse(key).label.replaceAll(".", "-")}` as ParseKeys);
          }
        }

        // Change label for series
        if (field.id === "isPartOf") {
          descLabel = key;
        }

        // Add to library
        library.push({
          value: key,
          label: descLabel ? descLabel : value,
          submitValue: value,
        });
      });
      return library;
    } else {
      return null;
    }
  };

  /**
   * Generates different form components based on the field
   * @param field
   * @param input
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateComponent = (field: MetadataField, input: any) => {
    input.id = input.name;
    if (field.collection) {
      if (Array.isArray(field.value)) {
        return (
          <CreatableSelect {...input}
            onBlur={e => { blurWithSubmit(e, input); }}
            isMulti
            isClearable={!field.readOnly}     // The component does not support readOnly, so we have to work around
            isSearchable={!field.readOnly}    // by setting other settings
            openMenuOnClick={!field.readOnly}
            menuIsOpen={field.readOnly ? false : undefined}
            options={generateReactSelectLibrary(field)}
            styles={selectFieldStyle(theme)}
            css={fieldTypeStyle(field.readOnly)}>
          </CreatableSelect>
        );
      } else {
        return (
          <Select {...input}
            onBlur={e => { blurWithSubmit(e, input); }}
            isClearable={!field.readOnly}     // The component does not support readOnly, so we have to work around
            isSearchable={!field.readOnly}    // by setting other settings
            openMenuOnClick={!field.readOnly}
            menuIsOpen={field.readOnly ? false : undefined}
            options={generateReactSelectLibrary(field)}
            styles={selectFieldStyle(theme)}
            css={fieldTypeStyle(field.readOnly)}>
          </Select>
        );
      }

    } else if (field.type === "date") {
      return (
        <ThemeProvider theme={calendarStyle(theme)}>
          <input {...input}
            type="datetime-local"
            name={field.id}
            // inputFormat="yyyy/MM/dd HH:mm"
            onBlur={e => { blurWithSubmit(e, input); }}
            readOnly={field.readOnly}
            css={[fieldTypeStyle(field.readOnly), inputFieldTypeStyle(field.readOnly),
              {
                resize: "none",
              },
            ]}
            data-testid="dateTimePicker"
          />
        </ThemeProvider>
      );
    } else if (field.type === "time") {
      return (
        <ThemeProvider theme={calendarStyle(theme)}>
          <input {...input}
            type="time"
            name={field.id}
            // inputFormat="HH:mm"
            onBlur={e => { blurWithSubmit(e, input); }}
            readOnly={field.readOnly}
            css={[fieldTypeStyle(field.readOnly), inputFieldTypeStyle(field.readOnly),
              {
                resize: "none",
              },
            ]}
          />
        </ThemeProvider>
      );
    } else if (field.type === "text_long") {
      return (
        <textarea {...input}
          onBlur={e => { blurWithSubmit(e, input); }}
          readOnly={field.readOnly}
          css={[fieldTypeStyle(field.readOnly), inputFieldTypeStyle(field.readOnly)]}
        />
      );
    } else {
      return (
        <input {...input}
          onBlur={e => { blurWithSubmit(e, input); }}
          readOnly={field.readOnly}
          css={[fieldTypeStyle(field.readOnly), inputFieldTypeStyle(field.readOnly)]}
        />
      );
    }
  };

  /**
   * Renders a field in a catalog
   * @param field
   * @param catalogIndex
   * @param fieldIndex
   */
  const renderField = (field: MetadataField, catalogIndex: number, fieldIndex: number) => {

    /**
     * Wrapper function for component generation.
     * Handles the special case of DateTimePicker/TimePicker, which
     * can"t handle empty string as a value (which is what Opencast uses to
     * represent no date/time)
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const generateComponentWithModifiedInput = (field: MetadataField, input: FieldInputProps<any, HTMLElement>) => {
      if ((field.type === "date" || field.type === "time") && input.value === "") {
        const { value, ...other } = input;
        return generateComponent(field, other);
      }
      // <input type="datetime-local"> is picky about its value and won"t accept
      // global datetime strings, so we have to convert them to local ourselves.
      // TODO: Also we really should not be modifying the input element like that
      // so ideally the conversion happens somewhere else in the code
      // (see error in the console for further details)
      if ((field.type === "date" || field.type === "time")) {
        input = cloneDeep(input);
        const leDate = new Date(input.value);
        leDate.setMinutes(leDate.getMinutes() - leDate.getTimezoneOffset());
        input.value = leDate.toISOString().slice(0, 16);
        return generateComponent(field, input);
      } else {
        return generateComponent(field, input);
      }
    };

    return (
      <Field key={fieldIndex}
        name={"catalog" + catalogIndex + "." + field.id}
        validate={getValidators(field)}
        // react-final-form complains if we don"t specify checkboxes here
        type={field.type === "boolean" ? "checkbox" : undefined}
      >
        {({ input, meta }) => (
          <div css={fieldStyle} data-testid={field.id}>
            <label css={fieldLabelStyle} htmlFor={input.name}>
              <>{
                i18n.exists(`metadata.labels.${field.id}`) ?
                  t(`metadata.labels.${field.id}` as ParseKeys) : field.id
              }</>
              {field.required &&
                <span css={fieldLabelRequiredStyle}>
                  {t("metadata.required")}
                </span>
              }
            </label>

            {generateComponentWithModifiedInput(field, input)}
            {meta.error && <span css={validateStyle(true)}>{meta.error}</span>}
          </div>
        )}
      </Field>
    );
  };

  const renderCatalog = (
    catalog: Catalog,
    catalogIndex: number,
    configureFields: { [key: string]: configureFieldsAttributes; },
  ) => {


    return (
      <div key={catalogIndex} css={catalogStyle}>
        <div css={[titleStyle(theme), titleStyleBold(theme)]}>
          {i18n.exists(`metadata.${catalog.title.replaceAll(".", "-")}`) ?
            t(`metadata.${catalog.title.replaceAll(".", "-")}` as ParseKeys) : catalog.title
          }
        </div>

        {catalog.fields.map((field, i) => {
          // Render fields based on given array (usually parsed from config settings)
          if (field.id in configureFields && "show" in configureFields[field.id]) {
            if (configureFields[field.id].show) {
              return renderField(field, catalogIndex, i);
            } else {
              return undefined;
            }
          }
          return renderField(field, catalogIndex, i);
        })}

      </div>
    );
  };

  /**
   * Main render function. Renders all catalogs in a single form
   */
  const render = () => {
    return (
      <Form
        onSubmit={onSubmit}
        subscription={{ submitting: true, pristine: true }} // Hopefully causes less rerenders
        initialValues={getInitialValues(catalogs)}
        render={({ handleSubmit, form }) => (
          <form onSubmit={event => {
            handleSubmit(event);
            // Ugly fix for form not getting updated after submit. TODO: Find a better fix
            form.reset();
          }} css={metadataStyle}>

            {getStatus === "failed" &&
              <ErrorBox>
                <span css={{ whiteSpace: "pre-line" }}>
                  {"A problem occurred during communication with Opencast. \n"}
                  {getError ?
                    t("various.error-details-text", { errorMessage: getError }) : undefined
                  }
                </span>
              </ErrorBox>
            }

            {catalogs.map((catalog, i) => {
              if (settings.metadata.configureFields) {
                if (catalog.title in settings.metadata.configureFields) {
                  // If there are no fields for a given catalog, do not render
                  if (Object.keys(settings.metadata.configureFields[catalog.title]).length > 0) {
                    return renderCatalog(catalog, i, settings.metadata.configureFields[catalog.title]);
                  } else {
                    return undefined;
                  }
                }
              }
              // If there are no settings for a given catalog, just render it completely
              return renderCatalog(catalog, i, {});
            })}

            {/* For debugging the forms current values*/}
            {/* <FormSpy subscription={{ values: true }}>
                {({ values }) => (
                  <pre>{JSON.stringify(values, null, 2)}</pre>
                )}
              </FormSpy> */}
          </form>
        )}
      />
    );
  };

  return (
    render()
  );
};

export default Metadata;
