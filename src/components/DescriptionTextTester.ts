import { rankWith, isMultiLineControl, and, optionIs } from "@jsonforms/core";

export default rankWith(
  3, //increase rank as needed
  and(
    isMultiLineControl,
    optionIs("readonly", true),
    optionIs("display", "description-text")
  )
);
