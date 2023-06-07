import { ControlProps } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import DescriptionText, { DescriptionTextProps } from "./DescriptionText";
import _omit from "lodash/omit";

type DescriptionTextOptions = DescriptionTextProps & {
  display: "description-text";
};

const DescriptionTextControl = ({
  data,
  id,
  label,
  uischema,
}: ControlProps) => {
  const restProps: Partial<DescriptionTextProps> = _omit(
    uischema?.options as DescriptionTextOptions,
    ["display", "multi", "readonly"]
  );
  return <DescriptionText value={data} id={id} label={label} {...restProps} />;
};

export default withJsonFormsControlProps(DescriptionTextControl);
