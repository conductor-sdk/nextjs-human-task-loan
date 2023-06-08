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

const baseTheme = createTheme({
  components: {
    MuiFormControl: {
      styleOverrides: {
        root: {
          height: "47px",
          marginBottom: 16,
          background: "#F1F6F7",
          borderRadius: "11px",
          "& label": {
            padding: "5px 0px 4px 9px",
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            "-webkit-text-fill-color": "#000000",
          },
          color: "#000000",
          "& ::after": {
            borderBottom: "none",
          },
          "& fieldset": {
            border: "none",
          },
        },
        input: {
          padding: "5px 0px 4px 9px",
          color: "#000000",
          fontSize: "14px",
          fontWeight: "600",
          lineHeight: "20px",

          "& :after": {
            borderBottom: "none",
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            "-webkit-text-fill-color": "#000000",
            color: "#000000",
          },
          color: "#000000",
          "&:before, :after, :hover:not(.Mui-disabled):before": {
            borderBottom: 0,
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          padding: "5px 0px 4px 9px",
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
