import { ValueObject } from "../../ValueObject";

interface IAddressProps {
  addressStreet: string;
  addressSuburb: string;
  addressState: string;
  addressPostcode: string;
}

export class Address extends ValueObject<IAddressProps> {
  constructor(props: IAddressProps) {
    super(props);
  }
}
