import { ValueObject } from "ddd/domain/ValueObject";

interface IEmailProps {
  value: string;
}

export class Email extends ValueObject<IEmailProps> {
  constructor(props: IEmailProps) {
    super(props);
  }

  static from(value: string): Email {
    if (Email.isValidEmail(value)) {
      return new Email({ value });
    }

    throw new Error(`Invalid email: ${value}`);
  }

  private static isValidEmail(possiblyAnEmail: string): boolean {
    return possiblyAnEmail.includes("@");
  }
}
