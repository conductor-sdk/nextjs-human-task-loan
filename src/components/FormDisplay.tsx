import { useMemo } from "react";
import { HumanTaskTemplateEntry } from "@io-orkes/conductor-javascript";
import { JsonForms } from "@jsonforms/react";

import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { JsonSchema, UISchemaElement } from "@jsonforms/core";

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
    <JsonForms
      schema={maybeSchema as JsonSchema}
      uischema={props.template!.templateUI! as unknown as UISchemaElement}
      data={props.formState}
      renderers={materialRenderers}
      cells={materialCells}
      onChange={({ data }) => props.onFormChange(data)}
      validationMode={
        props.displayErrors ? "ValidateAndShow" : "ValidateAndHide"
      }
    />
  );
};
