import { useMemo } from "react";
import { HumanTaskTemplateEntry } from "@io-orkes/conductor-javascript";
import { JsonForms } from "@jsonforms/react";
import { ThemeProvider, createTheme } from "@mui/material";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonSchema, UISchemaElement } from "@jsonforms/core";
import DescriptionTextTester from "./DescriptionTextTester";
import DescriptionTextControl from "./DescriptionTextControl";

export const baseTheme = createTheme({
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
    },
    MuiFormControl: {
      defaultProps: {
        variant: "filled",
      },
      styleOverrides: {
        root: {
          "& label": {
            top: "20px",
            left: "9px",
            zIndex: 1,
          },
          "& .MuiInputBase-root": {
            paddingTop: "18px",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "filled",
        InputLabelProps: {
          shrink: true,
        },
        InputProps: {
          disableUnderline: true,
        },
      },
    },
    MuiInputBase: {
      defaultProps: {
        //disableClearable: true,
      },
      styleOverrides: {
        root: {
          background: "#F1F6F7",
          borderRadius: "11px 11px 11px 11px !important",
          "& .MuiInputAdornment-root": {
            paddingRight: "15px",
            marginBottom: "10px",
          },
        },
        input: {
          paddingLeft: "9px",
          paddingRight: "9px",
          fontSize: "14px",
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          "& .MuiInput-root": {
            paddingLeft: "9px",
            paddingRight: "9px",
            fontSize: "14px",
          },
        },
      },
    },
    MuiInput: {
      defaultProps: {
        disableUnderline: true,
      },
      styleOverrides: {
        root: {
          color: "#000000",
        },
      },
    },
    MuiInputLabel: {
      defaultProps: {
        filled: true,
        shrink: true,
      },
    },
    MuiFormLabel: {
      defaultProps: {
        filled: true,
      },
      styleOverrides: {
        root: {
          fontSize: "12px",
        },
      },
    },
  },
});
const renderers = [
  ...materialRenderers,
  { tester: DescriptionTextTester, renderer: DescriptionTextControl },
];
type Props = {
  template: HumanTaskTemplateEntry;
  formState: Record<string, Record<string, any>>;
  onFormChange: (formChanges: Record<string, Record<string, any>>) => void;
  displayErrors: boolean;
};

export const FormDisplay = (props: Props) => {
  const maybeSchema = useMemo(() => {
    if (props.template?.jsonSchema != undefined) {
      const { $schema, ...restOfSchema } = props.template.jsonSchema;
      return restOfSchema;
    }
    return null;
  }, [props.template]);

  return (
    <ThemeProvider theme={baseTheme}>
      <JsonForms
        schema={maybeSchema as JsonSchema}
        uischema={props.template!.templateUI! as unknown as UISchemaElement}
        data={props.formState}
        renderers={renderers}
        cells={materialCells}
        onChange={({ data }) => props.onFormChange(data)}
        validationMode={
          props.displayErrors ? "ValidateAndShow" : "ValidateAndHide"
        }
      />
    </ThemeProvider>
  );
};
