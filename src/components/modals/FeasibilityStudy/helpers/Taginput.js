import React from 'react'
import { Input} from "antd";

export const TagInput = React.forwardRef((props, ref) => (
  <Input size="large" style={{ minWidth: "500px" }} {...props} ref={ref} className="tag-input" />
));

