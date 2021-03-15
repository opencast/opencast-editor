import React, { useEffect } from "react";

import { css } from '@emotion/react'
import { errorBoxStyle, nagivationButtonStyle } from '../cssStyles'

import { useSelector, useDispatch } from 'react-redux';
import {
  fetchMetadata, postMetadata, selectCatalogs,
  Catalog, MetadataField, setFieldValue, selectGetError, selectGetStatus, selectPostError, selectPostStatus
} from '../redux/metadataSlice'

import { Form, Field } from 'react-final-form'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable';

import {
  KeyboardDateTimePicker,
  showErrorOnBlur,
} from 'mui-rff';
import DateFnsUtils from "@date-io/date-fns";

import './../i18n/config';
import { useTranslation } from 'react-i18next';

/**
 * Creates a Metadata form
 */
const Metadata: React.FC<{}> = () => {

  const { t, i18n } = useTranslation();

  // Init redux variables
  const dispatch = useDispatch()
  const catalogs = useSelector(selectCatalogs);
  const getStatus = useSelector(selectGetStatus);
  const getError = useSelector(selectGetError);
  const postStatus = useSelector(selectPostStatus);
  const postError = useSelector(selectPostError);

  // Try to fetch URL from external API
  useEffect(() => {
    if (getStatus === 'idle') {
      dispatch(fetchMetadata())
    }
  }, [getStatus, dispatch])

  /**
   * CSS
   */

  const metadataStyle = css({
    // maxWidth: '1500px',
    // margin: '10px',
    padding: '20px',
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
    return (
      css({
        flex: '1',
        fontSize: '1em',
        marginLeft: '15px',
        borderRadius: '5px',
        backgroundColor: 'snow',
        boxShadow: isReadOnly ? '0 0 0px rgba(0, 0, 0, 0.3)' : '0 0 1px rgba(0, 0, 0, 0.3)',
        ...isReadOnly && {color: 'grey'}
      })
    );
  }

  const inputFieldTypeStyle = (isReadOnly: boolean) => {
    return (
      css({
        padding: '10px 10px',
        border: isReadOnly ? '0px solid #ccc' : '1px solid #ccc',
      })
    );
  }

  const selectFieldTypeStyle = {
    control: (provided: any) => ({
      ...provided,
      background: 'snow'
    }),
    menu: (provided: any) => ({
      ...provided,
      background: 'snow',
      // kill the gap
      marginTop: 0
    }),
  }

  const dateTimeTypeStyle = (isReadOnly: boolean) => {
    return (
      css ({
        padding: '5px 10px',
        border: isReadOnly ? '0px solid #ccc' : '1px solid #ccc',
      })
    );
  }

  const validateErrorStyle = css({
    lineHeight: '32px',
    marginLeft: '10px',
    color: '#800',
    fontWeight: 'bold',
  })

  const buttonContainerStyle = css({
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'center',
    marginTop: '25px',
  })

  // TODO: Rework all div buttons so the ':enabled' pseudo-class does not screw them over
  const basicButtonStyleCOPY = css({
    borderRadius: '10px',
    cursor: "pointer",
    // Animation
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    "&:hover:enabled": {
      transform: 'scale(1.1)',
    },
    "&:focus:enabled": {
      transform: 'scale(1.1)',
    },
    "&:active:enabled": {
      transform: 'scale(0.9)',
    },
    // Flex position child elements
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'center' as const,
  });

  const submitButtonStyle = css({
    background: 'snow',
    border: '1px solid #ccc',

    "&[disabled]": {
      opacity: '0.6',
      cursor: 'not-allowed',
    },
  })

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
    return re.test(value) ? undefined : t("metadata.validation.duration.format")
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
    } else {
      return undefined
    }
  }

  /**
   * Form Callbacks - Submitting
   */

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
    if (field && field.type === "date" && Object.prototype.toString.call(returnValue) === '[object Date]') {
      returnValue = returnValue.toJSON()
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
    if (field.collection) {
      if (Array.isArray(field.value)) {
        return (
          <CreatableSelect {...input}
            isMulti
            isClearable
            readOnly={field.readOnly}
            options={generateReactSelectLibrary(field)}
            styles={selectFieldTypeStyle}
            css={fieldTypeStyle(field.readOnly)}>
          </CreatableSelect>
          );
      } else {
        return (
          <Select {...input}
            readOnly={field.readOnly}
            options={generateReactSelectLibrary(field)}
            styles={selectFieldTypeStyle}
            css={fieldTypeStyle(field.readOnly)}>
          </Select>
          );
      }

    } else if (field.type === "date") {
      return (
        <div css={[fieldTypeStyle(field.readOnly), dateTimeTypeStyle(field.readOnly)]}>
          <KeyboardDateTimePicker {...input}
            name={field.id}
            format="yyyy/MM/dd HH:mm"
            disabled={field.readOnly}
            dateFunsUtils={DateFnsUtils}
            showError={showErrorOnBlur}
          />
        </div>
      );
    } else {
      return<input {...input}
        readOnly={field.readOnly}
        css={[fieldTypeStyle(field.readOnly), inputFieldTypeStyle(field.readOnly)]}/>
    }
  }

  /**
   * Renders a field in a catalog
   * @param field
   * @param catalogIndex
   * @param fieldIndex
   */
  const renderField = (field: MetadataField, catalogIndex: number, fieldIndex: number) => {
    return (
        <Field key={fieldIndex}
                name={"catalog" + catalogIndex + "." + field.id}
                validate={getValidators(field)}
                >
                {({ input, meta }) => (
                  <div css={fieldStyle}>
                    <label css={fieldLabelStyle}>{t(`metadata.labels.${field.id}`)}</label>

                    {generateComponent(field, input)}
                    {meta.error && meta.touched && <span css={validateErrorStyle}>{meta.error}</span>}
                  </div>
                )}
        </Field>
    );
  }

  /**
   * Renders a single catalog (e.g. dublincore/episode) in the form
   * @param catalog
   * @param catalogIndex
   */
  const renderCatalog = (catalog: Catalog, catalogIndex: number) => {
    return (
      <div key={catalogIndex}>
        <h2>{t(`metadata.${catalog.title.replaceAll(".", "-")}`)}</h2>

        {catalog.fields.map((field, i) => {
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
          initialValues={getInitialValues(catalogs)}
          render={({ handleSubmit, form, submitting, pristine, values}) => (
            <form onSubmit={event => {
              handleSubmit(event)
              // Ugly fix for form not getting updated after submit. TODO: Find a better fix
              form.reset()
            }} css={metadataStyle}>

              <div css={errorBoxStyle(getStatus === "failed")} title="Error Box" role="alert">
                <span>A problem occured during communication with Opencast.</span><br />
                {getError ? "Details: " + getError : "No error details are available."}<br />
              </div>

              {catalogs.map((catalog, i) => {
                return renderCatalog(catalog, i)
              })}

              <div title="buttons" css={buttonContainerStyle}>
                <button css={[basicButtonStyleCOPY, nagivationButtonStyle, submitButtonStyle]}
                  type="submit"
                  disabled={submitting || pristine}>
                    {t("metadata.submit-button")}
                </button>
                {/* <button css={[basicButtonStyle, nagivationButtonStyle, submitButtonStyle]}
                  type="button"
                  onClick={form.reset}
                  disabled={submitting || pristine}>
                    Reset
                </button> */}
              </div>

              <div css={errorBoxStyle(postStatus === "failed")} title="Error Box" role="alert">
                <span>A problem occured during communication with Opencast. <br />
                      Changes could not be saved to Opencast.</span><br />
                {postError ? "Details: " + postError : "No error details are available."}<br />
              </div>

              {/* For debugging the forms current values*/}
              {/* <pre>{JSON.stringify(values, null, 2)}</pre> */}
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
