
import { WidgetInstance } from "./widget-instance.model";

export interface Page {
    id: string;
    name: string;
    widgets: WidgetInstance[];
}
