import { ValueObject } from "ddd/domain/ValueObject";

interface IEmergencyContactProps {
  emergencyContactName: string | null;
  emergencyContactNumber: string | null;
  emergencyContactAddress: string | null;
  emergencyContactRelationship: string | null;
}

export class EmergencyContact extends ValueObject<IEmergencyContactProps> {
  constructor(props: IEmergencyContactProps) {
    super(props);
  }
}
