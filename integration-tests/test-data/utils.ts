import { fakerEN_AU_ocker as faker } from "@faker-js/faker";

function isDobOver18(dob: Date) {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 18;
}

function getYearInSchool(dob: Date) {
  const startOfSchool = new Date(`${dob.getFullYear() - 6}/07/01`);
  let age = dob.getFullYear() - startOfSchool.getFullYear();
  const m = startOfSchool.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && startOfSchool.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export const randomNumber = (length: number) =>
  Math.round(Math.random() * length);

const Sex = {
  male: "male",
  female: "female",
  unisex: "unisex",
  all: "all",
} as const;
type Sex = (typeof Sex)[keyof typeof Sex];

const male = [
  "father",
  "son",
  "uncle",
  "grandpa",
  "husband",
  "step-dad",
  "nonno",
  "step-son",
  "father-in-law",
  "brother-in-law",
  "son-in-law",
  "boyfriend",
];
const female = [
  "mother",
  "daughter",
  "aunt",
  "grandma",
  "wife",
  "nonna",
  "step-mum",
  "step-daughter",
  "mother-in-law",
  "sister-in-law",
  "daughter-in-law",
  "girlfriend",
];
const unisex = ["friend", "neighbour", "partner", "mate", "colleague"];
const maleGuardian = ["father", "uncle", "grandpa", "step-dad", "nonno"];
const femaleGuardian = ["mother", "aunt", "grandma", "nonna", "step-mum"];
const unisexGuardian = ["guardian", "foster parent"];

const relationships = {
  [Sex.male]: male,
  [Sex.female]: female,
  [Sex.unisex]: unisex,
  [Sex.all]: [...male, ...female, ...unisex],
};

const guardians = {
  [Sex.male]: maleGuardian,
  [Sex.female]: femaleGuardian,
  [Sex.unisex]: unisexGuardian,
  [Sex.all]: [...maleGuardian, ...femaleGuardian, ...unisexGuardian],
};

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const randomRelationship = (sex: Sex): string =>
  sex
    ? relationships[sex][randomNumber(relationships[sex].length - 1)]
    : relationships[Sex.all][randomNumber(relationships[Sex.all].length - 1)];

export const randomGuardian = (sex: Sex): string =>
  sex
    ? guardians[sex][randomNumber(guardians[sex].length - 1)]
    : guardians[Sex.all][randomNumber(guardians[Sex.all].length - 1)];

export function makeAPerson(
  dobOpts: { max: number; min: number } = { min: 17, max: 70 },
) {
  const sex: "male" | "female" = faker.person.sex() as "male" | "female";
  const firstName = faker.person.firstName(sex);
  const lastName = faker.person.lastName(sex);
  const fullName = `${firstName} ${lastName}`;

  const dateOfBirth = faker.date.birthdate({
    max: dobOpts.max,
    min: dobOpts.min,
    mode: "age",
  });
  const isOver18 = isDobOver18(dateOfBirth);
  const yearInSchool = getYearInSchool(dateOfBirth);

  const email = faker.internet.email({ firstName, lastName });
  const additionalEmail = faker.internet.email({ firstName, lastName });
  const mobile = faker.phone.number();

  const street = faker.location.street();
  const suburb = faker.location.city();
  const state = "WA"; //faker.address.state({ abbreviated: true });
  const postcode = faker.location.zipCode({ format: "6###" });
  const address = `${street}, ${suburb}, ${state}, ${postcode}`;

  const occupation = faker.person.jobTitle();
  const isRelated = isOver18 ? !!randomNumber(1) : true;
  const relationship = isOver18
    ? randomGuardian(isRelated ? sex : Sex.unisex)
    : randomGuardian(sex);
  const school = faker.company.name();

  return {
    address,
    additionalEmail,
    email,
    firstName,
    fullName,
    lastName,
    mobile,
    street,
    suburb,
    state,
    postcode,
    dateOfBirth,
    isOver18,
    isRelated,
    school,
    sex,
    occupation,
    relationship,
    yearInSchool,
  };
}

export const makeATeacher = () => {
  const sex: "male" | "female" = faker.person.sex() as "male" | "female";
  const firstName = faker.person.firstName(sex);
  const lastName = faker.person.lastName(sex);
  const fullName = `${firstName} ${lastName}`;

  const email = faker.internet.email({ firstName, lastName });

  return {
    sex,
    firstName,
    lastName,
    fullName,
    email,
  };
};

export const makeAGuardian = () => {
  const sex: "male" | "female" = faker.person.sex() as "male" | "female";
  const firstName = faker.person.firstName(sex);
  const lastName = faker.person.lastName(sex);
  const fullName = `${firstName} ${lastName}`;

  const email = faker.internet.email({ firstName, lastName });
  const mobile = faker.phone.number();

  const street = faker.location.street();
  const suburb = faker.location.city();
  const state = "WA"; //faker.address.state({ abbreviated: true });
  const postcode = faker.location.zipCode({ format: "6###" });
  const address = `${street}, ${suburb}, ${state}, ${postcode}`;

  const occupation = faker.person.jobTitle();
  const relationshipToStudent = randomGuardian(sex);

  return {
    sex,
    firstName,
    lastName,
    fullName,
    email,
    mobile,
    street,
    suburb,
    state,
    postcode,
    address,
    occupation,
    relationshipToStudent,
  };
};

export const makeAStudent = () => {
  const sex: "male" | "female" = faker.person.sex() as "male" | "female";
  const firstName = faker.person.firstName(sex);
  const lastName = faker.person.lastName(sex);
  const fullName = `${firstName} ${lastName}`;

  const dateOfBirth = faker.date.birthdate({
    max: 18,
    min: 6,
    mode: "age",
  });
  const yearInSchool = getYearInSchool(dateOfBirth);

  const street = faker.location.street();
  const suburb = faker.location.city();
  const state = "WA"; //faker.address.state({ abbreviated: true });
  const postcode = faker.location.zipCode({ format: "6###" });
  const address = `${street}, ${suburb}, ${state}, ${postcode}`;

  const relationship = randomGuardian(sex);
  const school = faker.company.name();

  return {
    address,
    dateOfBirth,
    firstName,
    fullName,
    guardians: Array(randomNumber(3) || 1)
      .fill(1)
      .map(() => makeAGuardian()),
    lastName,
    postcode,
    relationship,
    school,
    sex,
    state,
    street,
    suburb,
    teachers: Array(randomNumber(3) || 1)
      .fill(1)
      .map(() => makeATeacher()),
    yearInSchool,
  };
};
