import type { IAggregateRoot } from "../../IAggregateRoot";

import { Entity } from "../../Entity";
import { Email } from "../../EmailValueObject";
import { Address } from "./AddressValueObject";
import { EmergencyContact } from "./EmergencyContactValueObject";
import { NextOfKin } from "./NextOfKinValueObject";

export interface MentorProps {
  azureADId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  fullName: string;
  mobile: string;
  addressStreet: string;
  addressSuburb: string;
  addressState: string;
  addressPostcode: string;
  additionalEmail: string | null;
  dateOfBirth: Date | null;
  frequencyInDays: number | null;
  emergencyContactName: string | null;
  emergencyContactNumber: string | null;
  emergencyContactAddress: string | null;
  emergencyContactRelationship: string | null;
  nextOfKinName: string | null;
  nextOfKinNumber: string | null;
  nextOfKinAddress: string | null;
  nextOfKinRelationship: string | null;
  profilePicturePath: string | null;
  hasApprovedToPublishPhotos: boolean | null;
  volunteerAgreementSignedOn: Date | null;
  endDate: Date | null;
  endReason: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  chapterId: number;
}

export interface MentorCommand {
  firstName: string;
  lastName: string;
  preferredName: string | null;
  mobile: string;
  addressStreet: string;
  addressSuburb: string;
  addressState: string;
  addressPostcode: string;
  additionalEmail: string | null;
  dateOfBirth: Date | null;
  frequencyInDays: number | null;
  emergencyContactName: string | null;
  emergencyContactNumber: string | null;
  emergencyContactAddress: string | null;
  emergencyContactRelationship: string | null;
  hasApprovedToPublishPhotos: boolean | null;
  chapterId: number;
}

export class Mentor extends Entity implements IAggregateRoot {
  private _azureADId: string | null;
  private _firstName: string;
  private _lastName: string;
  private _preferredName: string | null;
  private _fullName: string;
  private _mobile: string;
  private _additionalEmail: string | null;
  private _dateOfBirth: Date | null;
  private _frequencyInDays: number | null;
  private _profilePicturePath: string | null;
  private _hasApprovedToPublishPhotos: boolean | null;
  private _volunteerAgreementSignedOn: Date | null;
  private _endDate: Date | null;
  private _endReason: string | null;
  private _createdAt: Date;
  private _updatedAt: Date | null;
  private _chapterId: number;

  private _email: Email;
  private _address: Address;
  private _emergencyContact: EmergencyContact;
  private _nextOfKin: NextOfKin;

  public get azureADId(): string | null {
    return this._azureADId;
  }

  public get firstName(): string {
    return this._firstName;
  }

  public get lastName(): string {
    return this._lastName;
  }

  public get preferredName(): string | null {
    return this._preferredName;
  }

  public get fullName(): string {
    return this._fullName;
  }

  public get mobile(): string {
    return this._mobile;
  }

  public get additionalEmail(): string | null {
    return this._additionalEmail;
  }

  public get dateOfBirth(): Date | null {
    return this._dateOfBirth;
  }

  public get frequencyInDays(): number | null {
    return this._frequencyInDays;
  }

  public get profilePicturePath(): string | null {
    return this._profilePicturePath;
  }

  public get hasApprovedToPublishPhotos(): boolean | null {
    return this._hasApprovedToPublishPhotos;
  }

  public get volunteerAgreementSignedOn(): Date | null {
    return this._volunteerAgreementSignedOn;
  }

  public get endDate(): Date | null {
    return this._endDate;
  }

  public get endReason(): string | null {
    return this._endReason;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date | null {
    return this._updatedAt;
  }

  public get chapterId(): number {
    return this._chapterId;
  }

  public get email(): Email {
    return this._email;
  }

  public get address(): Address {
    return this._address;
  }

  public get emergencyContact(): EmergencyContact {
    return this._emergencyContact;
  }

  public get nextOfKin(): NextOfKin {
    return this._nextOfKin;
  }

  private constructor(
    {
      azureADId,
      email,
      firstName,
      lastName,
      preferredName,
      fullName,
      mobile,
      addressStreet,
      addressSuburb,
      addressState,
      addressPostcode,
      additionalEmail,
      dateOfBirth,
      frequencyInDays,
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactAddress,
      emergencyContactRelationship,
      nextOfKinName,
      nextOfKinNumber,
      nextOfKinAddress,
      nextOfKinRelationship,
      profilePicturePath,
      hasApprovedToPublishPhotos,
      volunteerAgreementSignedOn,
      endDate,
      endReason,
      createdAt,
      updatedAt,
      chapterId,
    }: MentorProps,
    id?: number,
  ) {
    super(id);
    this._azureADId = azureADId;
    this._firstName = firstName;
    this._lastName = lastName;
    this._preferredName = preferredName;
    this._fullName = fullName;
    this._mobile = mobile;
    this._additionalEmail = additionalEmail;
    this._dateOfBirth = dateOfBirth;
    this._frequencyInDays = frequencyInDays;
    this._profilePicturePath = profilePicturePath;
    this._hasApprovedToPublishPhotos = hasApprovedToPublishPhotos;
    this._volunteerAgreementSignedOn = volunteerAgreementSignedOn;
    this._endDate = endDate;
    this._endReason = endReason;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._chapterId = chapterId;

    this._email = Email.from(email);

    this._address = new Address({
      addressStreet,
      addressSuburb,
      addressState,
      addressPostcode,
    });

    this._emergencyContact = new EmergencyContact({
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactAddress,
      emergencyContactRelationship,
    });

    this._nextOfKin = new NextOfKin({
      nextOfKinName,
      nextOfKinNumber,
      nextOfKinAddress,
      nextOfKinRelationship,
    });
  }

  public static create(props: MentorProps, id?: number) {
    return new Mentor(props, id);
  }

  public updateInfo({
    firstName,
    lastName,
    preferredName,
    mobile,
    additionalEmail,
    dateOfBirth,
    frequencyInDays,
    hasApprovedToPublishPhotos,
    chapterId,
    addressStreet,
    addressSuburb,
    addressState,
    addressPostcode,
    emergencyContactName,
    emergencyContactNumber,
    emergencyContactAddress,
    emergencyContactRelationship,
  }: MentorCommand) {
    this._firstName = firstName;
    this._lastName = lastName;
    this._preferredName = preferredName;
    this._mobile = mobile;
    this._additionalEmail = additionalEmail;
    this._dateOfBirth = dateOfBirth;
    this._frequencyInDays = frequencyInDays;
    this._hasApprovedToPublishPhotos = hasApprovedToPublishPhotos;
    this._chapterId = chapterId;

    this._address = new Address({
      addressStreet,
      addressSuburb,
      addressState,
      addressPostcode,
    });

    this._emergencyContact = new EmergencyContact({
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactAddress,
      emergencyContactRelationship,
    });
  }

  public updateEmail(email: string) {
    if (this._azureADId !== null && this._email.props.value !== email) {
      throw new Error(
        "Email cannot be changed for mentors with an Azure AD ID.",
      );
    } else {
      this._email = Email.from(email);
    }
  }

  public updateProfilePath(profilePicturePath: string | null) {
    this._profilePicturePath = profilePicturePath;
  }

  public updateAzureId(azureADId: string | null) {
    this._azureADId = azureADId;
  }

  public signVolunteerAgreement() {
    this._volunteerAgreementSignedOn = new Date();
  }

  public archive(endReason: string) {
    this._endDate = new Date();
    this._azureADId = null;
    this._endReason = endReason;
  }

  public unarchive() {
    this._endDate = null;
  }
}
