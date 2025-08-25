import { ValueObject } from "ddd/domain/ValueObject";

interface INextOfKinProps {
  nextOfKinName: string | null;
  nextOfKinNumber: string | null;
  nextOfKinAddress: string | null;
  nextOfKinRelationship: string | null;
}

export class NextOfKin extends ValueObject<INextOfKinProps> {
  constructor(props: INextOfKinProps) {
    super(props);
  }
}
