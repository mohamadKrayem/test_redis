import { faker } from "@faker-js/faker";
import {User} from './types';
import moment from 'moment';

function generateString(desiredLength: number, field: string, firstNameArg?: string, lastNameArg?: string): string {
  let result = "";
  switch(field) {
    case "first":
      result = faker.person.firstName();
      break;
    case "last":
      result = faker.person.lastName();
      break;
    case "username":
      result = faker.internet.userName({firstName: firstNameArg, lastName: lastNameArg});
      break;
    case "company":
      result = faker.company.name();
      break;
    default:
      result = faker.person.firstName();
      break;
  }

  if(desiredLength < 0) return result;

  return result.substring(0, desiredLength);
}

function createRandomUser(id: number): User {
  const entity_name: string = generateString(-1, "company");
  const entity: number = id;
  const isAdmin: boolean = faker.datatype.boolean();
  const lockedSince: string = moment(faker.date.anytime()).format("yyyy-MM-DD HH:mm");
  const first_name: string = generateString(10, "first");
  const username: string = generateString(20, "username", first_name, entity_name);
  const userId: number = faker.number.int() * (id||1);
  const numberOfAttempts: number = faker.number.int({min: 3, max: 10});

  return {
    entity: entity,
    entity_name: entity_name,
    isAdmin: isAdmin,
    lockedSince: lockedSince,
    username: username,
    numberOfAttempts: numberOfAttempts,
    id: userId,
  }
};

export function createRandomUsersArray(length: number): User[] {
  let array_of_users: User[] = [];
  for(let i=0; i<length; i++) {
    array_of_users.push(createRandomUser(i));
  }

  return array_of_users;
}

