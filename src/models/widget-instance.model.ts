
export interface WidgetInstance {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  props?: { [key: string]: any };
  ui?: {
    semiStroke?: boolean;
    locked?: boolean;
  };
  children?: WidgetInstance[];
}
