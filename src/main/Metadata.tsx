import React, { useEffect } from "react";

import { css } from '@emotion/react'
import { errorBoxStyle, selectFieldStyle } from '../cssStyles'

import { useSelector, useDispatch } from 'react-redux';
import {
  fetchMetadata, postMetadata, selectCatalogs,
  Catalog, MetadataField, setFieldValue, selectGetError, selectGetStatus, selectPostError, selectPostStatus, setFieldReadonly
} from '../redux/metadataSlice'

import { Form, Field, FieldInputProps } from 'react-final-form'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable';

import {
  DateTimePicker,
  TimePicker,
  showErrorOnBlur,
} from 'mui-rff';
import DateFnsUtils from "@date-io/date-fns";

import './../i18n/config';
import i18next from "./../i18n/config";
import { useTranslation } from 'react-i18next';
import { DateTime as LuxonDateTime} from "luxon";

import { configureFieldsAttributes, settings } from '../config'
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AppDispatch } from "../redux/store";
import { selectTheme } from "../redux/themeSlice";


/**
 * Creates a Metadata form
 *
 * Takes data from a redux slice and throws it into a react-final-form.
 * When submitting, the state in the redux slice gets updated
 *
 * If something doesn't work, main places of interest are the submit function
 * and the initialValues function
 */
const Metadata: React.FC<{}> = () => {

  const { t, i18n } = useTranslation();

  // Init redux variables
  const dispatch = useDispatch<AppDispatch>()
  const catalogs = useSelector(selectCatalogs);
  const getStatus = useSelector(selectGetStatus);
  const getError = useSelector(selectGetError);
  const postStatus = useSelector(selectPostStatus);
  const postError = useSelector(selectPostError);
  const theme = useSelector(selectTheme);

  // Try to fetch URL from external API
  useEffect(() => {
    if (getStatus === 'idle') {
      dispatch(fetchMetadata())
    }
  }, [getStatus, dispatch])

  // Overwrite readonly property of fields based on config settings
  useEffect(() => {
    if (getStatus === 'success') {
      for(let catalogIndex = 0; catalogIndex < catalogs.length; catalogIndex++) {
        if (settings.metadata.configureFields) {
          let configureFields = settings.metadata.configureFields
          let catalog = catalogs[catalogIndex]

          if (catalog.title in configureFields) {
            if (Object.keys(configureFields[catalog.title]).length > 0) {
              let configureFieldsCatalog = configureFields[catalog.title]

              for (let fieldIndex = 0; fieldIndex < catalog.fields.length; fieldIndex++) {
                if (catalog.fields[fieldIndex].id in configureFieldsCatalog) {
                  if ("readonly" in configureFieldsCatalog[catalog.fields[fieldIndex].id]) {
                    dispatch(setFieldReadonly({catalogIndex: catalogIndex, fieldIndex: fieldIndex,
                      value: configureFieldsCatalog[catalog.fields[fieldIndex].id].readonly
                    }))
                  }
                }
              }
            } else {
              return undefined
            }
          }
        }
      }
    }
  }, [getStatus, catalogs, dispatch])

  /**
   * CSS
   */

  const metadataStyle = css({
    padding: '20px',
    marginLeft:'auto',
    marginRight:'auto',
    minWidth: '50%',
    display: 'grid',
  })

  const fieldStyle = css({
    display: 'flex',
    flexFlow: 'row nowrap',
    lineHeight: '2em',
    margin: '10px',
  })

  const fieldLabelStyle = css({
    alignSelf: 'center',
    width: '110px',
    fontSize: '1em',
    lineHeight: '32px',
  })

  const fieldTypeStyle = (isReadOnly: boolean) => {
    return css({
      flex: '1',
      fontSize: '1em',
      marginLeft: '15px',
      borderRadius: '5px',
      boxShadow: isReadOnly ? '0 0 0px rgba(0, 0, 0, 0.3)' : '0 0 1px rgba(0, 0, 0, 0.3)',
      ...(isReadOnly && {color: `${theme.text}`}),
      color: `${theme.text}`,
      outline: isReadOnly ? '0px solid transparent' : `${theme.element_outline}`
    });
  }

  const inputFieldTypeStyle = (isReadOnly: boolean) => {
    return (
      css({
        padding: '10px 10px',
        border: isReadOnly ? '0px solid #ccc' : '1px solid #ccc',
        background: isReadOnly ? `${theme.background}` : `${theme.element_bg}`,
      })
    );
  }

  const dateTimeTypeStyle = (isReadOnly: boolean) => {
    return (
      css ({
        padding: '5px 10px',
        border: isReadOnly ? '0px solid #ccc' : '1px solid #ccc',
        background: isReadOnly ? `${theme.background}` : `${theme.element_bg}`,
        '.Mui-disabled, .Mui-disabled button > svg': {
          color: `${theme.disabled} !important`,
          'WebkitTextFillColor':`${theme.disabled}`,
        },
        'button > svg': {
          color: `${theme.indicator_color}`
        },
        '.MuiInput-input, button': {
          color: `${theme.text}`,
          background: 'transparent !important',
          '&:hover': {
            background: 'transparent !important',
            outline: 'none'
          }
        },    
      })
    );
  }

  const validateStyle = (isError: boolean) => {
    return css({
      lineHeight: '32px',
      marginLeft: '10px',
      ...(isError && {color: `${theme.error}`}),
      fontWeight: 'bold',
    });
  }

  // const buttonContainerStyle = css({
  //   display: 'flex',
  //   flexFlow: 'row nowrap',
  //   justifyContent: 'space-around',
  //   marginTop: '25px',
  // })

  // // TODO: Rework all div buttons so the ':enabled' pseudo-class does not screw them over
  // const basicButtonStyleCOPY = css({
  //   borderRadius: '10px',
  //   cursor: "pointer",
  //   // Animation
  //   transitionDuration: "0.3s",
  //   transitionProperty: "transform",
  //   "&:hover:enabled": {
  //     transform: 'scale(1.1)',
  //   },
  //   "&:focus:enabled": {
  //     transform: 'scale(1.1)',
  //   },
  //   "&:active:enabled": {
  //     transform: 'scale(0.9)',
  //   },
  //   // Flex position child elements
  //   display: 'flex',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   gap: '10px',
  //   textAlign: 'center' as const,
  // });

  // const submitButtonStyle = css({
  //   background: 'snow',
  //   border: '1px solid #ccc',

  //   "&[disabled]": {
  //     opacity: '0.6',
  //     cursor: 'not-allowed',
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
  const helperHandleArrays = (library: any[] | null, input: any, output: any[]) => {
    // If the value is hid inside an array, we need to extract it
    if (Array.isArray(input)) {
      input.forEach((subArray: any) => {
        output.push(helperHandleArrays(library, subArray, output))
      })
    }

    // Find react-select equivalent for inital value
    return library?.find(el => el.submitValue === input)
  }

  /**
   * Returns a data structure to initialize the form fields with
   * @param catalogs
   */
  const getInitialValues = (catalogs: Catalog[]) => {
    const initValues : { [n: string]: any } = {};

    catalogs.forEach((catalog: Catalog, catalogIndex: number) => {
      initValues["catalog" + catalogIndex] = {}
      catalog.fields.forEach((field: MetadataField) =>{
        initValues["catalog" + catalogIndex][field.id] = field.value

        // Handle initial values for select fields differently
        // Since react-select creates different values
        if (field.collection) {
          const library = generateReactSelectLibrary(field)
          let searchValue : any = field.value

          if (Array.isArray(searchValue)) {
            let result: any[] = [];
            helperHandleArrays(library, field.value, result)
            searchValue = result
          } else {
            searchValue = library?.find(el => el.submitValue === searchValue)
          }

          initValues["catalog" + catalogIndex][field.id] = searchValue
        }
      })
    })

    return initValues
  }

  /**
   * Form Callbacks - Validation
   */

  /**
   * Validator for required fields
   * @param value
   */
  const required = (value: any) => (value ? undefined : t("metadata.validation.required"))

  /**
   * Validator for the duration field
   * @param value
   */
  const duration = (value: any) => {
    let re: RegExp = /^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]$/
    return re.test(value) ? undefined : t("metadata.validation.duration-format")
  }

  /**
   * Validator for the date time fields
   * @param date
   */
  const dateTimeValidator = (date: any) => {
    // Empty field is valid value in Opencast
    if (!date) {
      return undefined
    }

    let dt = undefined
    if (Object.prototype.toString.call(date) === '[object Date]') {
      dt = LuxonDateTime.fromJSDate(date);
    }
    if (typeof(date) === 'string') {
      dt = LuxonDateTime.fromISO(date);
    }

    if (dt) {
      return dt.isValid ? undefined : t("metadata.validation.datetime")
    }
    return t("metadata.validation.datetime")
  }

  // // Function that combines multiple validation functions. Needs to be made typescript conform
  // const composeValidators = (...validators) => value =>
  // validators.reduce((error, validator) => error || validator(value), undefined)

  /**
   * Returns the desired combination of validators for a given field
   * TODO: Fix 'composeValidators' so this function can actually work as advertised
   * @param field
   */
  const getValidators = (field: MetadataField) => {
    if (field.required) {
      return required
    } else if (field.id === "duration") {
      return duration
    } else if (field.type === "date" || field.type === "time") {
      return dateTimeValidator
    } else {
      return undefined
    }
  }

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
  const submitSingleField = (value: any, fieldId: string) => {
    const catalogIndexString = fieldId.substring(
      fieldId.indexOf("g") + 1,
      fieldId.indexOf(".")
    );
    const fieldName = fieldId.substring(
      fieldId.indexOf(".") + 1,
      fieldId.length
    );
    const catalogIndex = parseInt(catalogIndexString)

    // Find the corresponding field index in the redux catalog
    for (let fieldIndex = 0; fieldIndex < catalogs[catalogIndex].fields.length; fieldIndex++) {
      if (catalogs[catalogIndex].fields[fieldIndex].id === fieldName) {
        // Update the field in the redux catalog
        dispatch(setFieldValue({catalogIndex: catalogIndex, fieldIndex: fieldIndex,
          value: parseValue(catalogs[catalogIndex].fields[fieldIndex], value)}))
        break
      }
    }
  }

  /**
   * Executes given blur callback while also sending the value of the current field to redux
   * @param e
   * @param input
   */
  const blurWithSubmit = (e: any, input: any) => {
      input.onBlur(e);
      submitSingleField(input.value, input.name)
  }

  /**
   * Helper function for onSubmit
   * Corrects formatting for certain form values
   * @param field
   * @param value
   */
  const parseValue = (field: MetadataField | null, value: any) => {
    let returnValue : any = value

    // Parse values out react-multi-select and put them in an array
    if(Array.isArray(value)) {
      returnValue = []
      value.forEach((subValue : any) => {
        returnValue.push(parseValue(null, subValue))  // Pass field as null to avoid each value into an array later on
      })
    }

    // If the value is hidden an object due to react-select, extract it
    if (typeof value === 'object' && value !== null && value.hasOwnProperty("submitValue")) {
      returnValue = value.submitValue
    } else if (typeof value === 'object' && value !== null && value.__isNew__) {
      returnValue = value.value
    }

    // For these fields, the value needs to be inside an array
    if (field && !Array.isArray(value) &&(field.id === "creator" || field.id === "contributor")) {
      returnValue = [returnValue]
    }

    // For these fields, the value needs to be inside an array
    if (field && (field.type === "date" || field.type === "time") && Object.prototype.toString.call(returnValue) === '[object Date]') {
      // If invalid date
      if ((isNaN(returnValue.getTime()))) {
        // Do nothing
      } else {
        returnValue = returnValue.toJSON()
      }
    } else if (field && (field.type === "date" || field.type === "time") && typeof returnValue === "string") {
      if (returnValue !== "") { // Empty string is allowed
        returnValue = new Date(returnValue).toJSON()
      }
    }

    return returnValue
  }

  /**
   * Callback for when the form is submitted
   * Saves values in redux state and sends them to Opencast
   * @param values
   */
  const onSubmit = (values: { [x: string]: { [x: string]: any; }; }) => {
    // For each submitted value, get the catalog it belongs to
    Object.keys(values).forEach((formCatalogName: string) => {
      let catalogIndex = parseInt(formCatalogName.replace("catalog", ""))

      // For each field in the submitted values
      Object.keys(values[formCatalogName]).forEach((formFieldName: any) => {
        // Find the corresponding field index in the redux catalog
        for (let fieldIndex = 0; fieldIndex < catalogs[catalogIndex].fields.length; fieldIndex++) {
          if (catalogs[catalogIndex].fields[fieldIndex].id === formFieldName) {
            // Update the field in the redux catalog
            dispatch(setFieldValue({catalogIndex: catalogIndex, fieldIndex: fieldIndex,
              value: parseValue(catalogs[catalogIndex].fields[fieldIndex], values[formCatalogName][formFieldName])}))
            break
          }
        }
      })

      // Send updated values to Opencast
      dispatch(postMetadata())
    })
  }

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
      // For whatever reason react-select uses 'value' as their key, which is not at all confusing
      const library: [{value: any, label: any, submitValue: any}] = [{value: "", label: "No value", submitValue: ""}]
      Object.entries(field.collection).forEach(([key, value]) => {
        // // Parse License
        // let [err, result] = safeJsonParse(key)
        // if (!err) {
        //   console.log(result)
        // }

        // Parse Label
        let descLabel = null
        if (i18n.exists(`metadata.${field.id}`)) {
          descLabel = t(`metadata.${field.id}.${key.replaceAll(".", "-")}`)

          if (field.id === "license") {
            descLabel = t(`metadata.${field.id}.${JSON.parse(key).label.replaceAll(".", "-")}`)
          }
        }

        // Change label for series
        if (field.id === "isPartOf") {
          descLabel = key
        }

        // Add to library
        library.push({
          value: key,
          label: descLabel ? descLabel : value,
          submitValue: value
        })
      })
      return library
    } else {
      return null
    }
  }

  /**
   * Generates different form components based on the field
   * @param field
   * @param input
   */
  const generateComponent = (field: MetadataField, input: any) => {
    input.id = input.name
    if (field.collection) {
      if (Array.isArray(field.value)) {
        return (
          <CreatableSelect {...input}
            onBlur={e => {blurWithSubmit(e, input)}}
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
            onBlur={e => {blurWithSubmit(e, input)}}
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
        <div data-testid="dateTimePicker" css={[fieldTypeStyle(field.readOnly), dateTimeTypeStyle(field.readOnly)]}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker {...input}
              name={field.id}
              inputFormat="yyyy/MM/dd HH:mm"
              disabled={field.readOnly}
              dateFunsUtils={DateFnsUtils}
              TextFieldProps={{
                variant: 'standard', // Removes default outline
                onBlur: (e: any) => {blurWithSubmit(e, input)},
                showError: showErrorOnBlur
              }}
              leftArrowButtonText={i18next.t('metadata.calendar-prev')}
              rightArrowButtonText={i18next.t('metadata.calendar-next')}
            />
          </LocalizationProvider>
        </div>
      );
    } else if (field.type === "time") {
      return (
        <div css={[fieldTypeStyle(field.readOnly), dateTimeTypeStyle(field.readOnly)]}>
          <TimePicker {...input}
            name={field.id}
            inputFormat="HH:mm"
            disabled={field.readOnly}
            dateFunsUtils={DateFnsUtils}
            TextFieldProps={{
              variant: 'standard', // Removes default outline
              onBlur: (e: any) => {blurWithSubmit(e, input)},
              showError: showErrorOnBlur
            }}
          />
        </div>
      );
    } else if (field.type === "text_long") {
      return (
        <textarea {...input}
          onBlur={e => {blurWithSubmit(e, input)}}
          readOnly={field.readOnly}
          css={[fieldTypeStyle(field.readOnly), inputFieldTypeStyle(field.readOnly)]}
        />
      );
    } else {
      return(
        <input {...input}
          onBlur={e => {blurWithSubmit(e, input)}}
          readOnly={field.readOnly}
          css={[fieldTypeStyle(field.readOnly), inputFieldTypeStyle(field.readOnly)]}
        />
      );
    }
  }

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
     * can't handle empty string as a value (which is what Opencast uses to
     * represent no date/time)
     */
    const generateComponentWithModifiedInput = (field: MetadataField, input: FieldInputProps<any, HTMLElement>) => {
      if ((field.type === "date" || field.type === "time") && input.value === "") {
        var {value, ...other} = input
        return generateComponent(field, other)
      } else {
        return generateComponent(field, input)
      }
    }

    return (
        <Field key={fieldIndex}
                name={"catalog" + catalogIndex + "." + field.id}
                validate={getValidators(field)}
                type={field.type === "boolean" ? "checkbox" : undefined}  // react-final-form complains if we don't specify checkboxes here
                >
                {({ input, meta }) => (
                  <div css={fieldStyle} data-testid={field.id}>
                    <label css={fieldLabelStyle} htmlFor={input.name}>{
                      i18n.exists(`metadata.labels.${field.id}`) ?
                      t(`metadata.labels.${field.id}`) : field.id
                    }</label>

                    {generateComponentWithModifiedInput(field, input)}
                    {meta.error && meta.touched && <span css={validateStyle(true)}>{meta.error}</span>}
                  </div>
                )}
        </Field>
    );
  }

  const renderCatalog = (
    catalog: Catalog,
    catalogIndex: number,
    configureFields: { [key: string]: configureFieldsAttributes }
  ) => {
    return (
      <div key={catalogIndex}>
        <h2>
          {i18n.exists(`metadata.${catalog.title.replaceAll(".", "-")}`) ?
            t(`metadata.${catalog.title.replaceAll(".", "-")}`) : catalog.title
          }
        </h2>

        {catalog.fields.map((field, i) => {
          // Render fields based on given array (usually parsed from config settings)
          if (field.id in configureFields && "show" in configureFields[field.id]) {
            if (configureFields[field.id].show) {
              return renderField(field, catalogIndex, i)
            } else {
              return undefined
            }
          }
          return renderField(field, catalogIndex, i)
        })}

      </div>
    );
  }

  /**
   * Main render function. Renders all catalogs in a single form
   */
  const render = () => {
    return (
        <Form
          onSubmit={onSubmit}
          subscription={{ submitting: true, pristine: true }} // Hopefully causes less rerenders
          initialValues={getInitialValues(catalogs)}
          render={({ handleSubmit, form, submitting, pristine, values}) => (
            <form onSubmit={event => {
              handleSubmit(event)
              // Ugly fix for form not getting updated after submit. TODO: Find a better fix
              form.reset()
            }} css={metadataStyle}>

              <div css={errorBoxStyle(getStatus === "failed", theme)} role="alert">
                <span>A problem occurred during communication with Opencast.</span><br />
                {getError ? "Details: " + getError : "No error details are available."}<br />
              </div>

              {catalogs.map((catalog, i) => {
                if (settings.metadata.configureFields) {
                  if (catalog.title in settings.metadata.configureFields) {
                    // If there are no fields for a given catalog, do not render
                    if (Object.keys(settings.metadata.configureFields[catalog.title]).length > 0) {
                      return renderCatalog(catalog, i, settings.metadata.configureFields[catalog.title])
                    } else {
                      return undefined
                    }
                  }
                }
                // If there are no settings for a given catalog, just render it completely
                return renderCatalog(catalog, i, {})
              })}

{/*
                <div css={{display: "block", wordWrap: "normal", whiteSpace: "pre"}}>{t("metadata.submit-helpertext", { buttonName: t("metadata.submit-button") })}</div>


              <div title="buttons" css={buttonContainerStyle}>
                <button css={[basicButtonStyleCOPY, nagivationButtonStyle, submitButtonStyle]}
                  type="submit"
                  title={t("metadata.submit-button-tooltip")}
                  aria-label={t("metadata.submit-button-tooltip")}
                  disabled={submitting || pristine}>
                    {t("metadata.submit-button")}
                </button>
                <button css={[basicButtonStyleCOPY, nagivationButtonStyle, submitButtonStyle]}
                  type="button"
                  title={t("metadata.reset-button-tooltip")}
                  aria-label={t("metadata.reset-button-tooltip")}
                  onClick={() => {form.reset()}}
                  disabled={submitting || pristine}>
                    {t("metadata.reset-button")}
                </button>
              </div> */}

              <div css={errorBoxStyle(postStatus === "failed", theme)} role="alert">
                <span>A problem occurred during communication with Opencast. <br />
                      Changes could not be saved to Opencast.</span><br />
                {postError ? "Details: " + postError : "No error details are available."}<br />
              </div>

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
  }

  return (
    render()
  );
}

export default Metadata;
