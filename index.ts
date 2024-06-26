import express, { Express, Response, Request } from "express";
const asyncHandler = require("express-async-handler");
import { createRandomUsersArray } from "./Dummy/Locked_users/locked-users";
const cors = require("cors");
import { Redis } from "ioredis";
import moment from "moment";
import { faker } from "@faker-js/faker";

const redis: Redis = new Redis();

const app: Express = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

let lockedUsers = createRandomUsersArray(20);

redis.set("testKey", "testValue");

app.get("/records", ({}, res: Response) => {
  let records = [
    {
      title: "Mohamad Krayem",
      start: new Date("08:00"),
      end: new Date("16:50"),
      color: "black",
      id: 1,
    },
    {
      title: "Hussein Al-Khateeb",
      start: new Date("08:00"),
      end: new Date("16:50"),
      color: "black",
      id: 2,
    },
  ];

  let args = [];
  for (let record of records) {
    args.push(record.title);
    args.push(record.id);
  }

  redis.hset("listOfUsers:1", ...args);
  // redis.hgetall("listOfUsers:1", (err, result) => {
  //   console.log("result: ", result);
  // });

  res.status(200).send(records);
});

app.get(
  "/listOfTerminals",
  asyncHandler(async ({}, res: Response) => {
    const { terminals } = require("./Dummy/TaStatus");

    const before13mins = moment().subtract(13, "minutes").toString();
    const before2mins = moment().subtract(2, "minutes").toString();

    for (let terminal of terminals) {
      let fakeDate = faker.date.between({
        from: terminal.model == 1 ? before2mins : before13mins,
        to: moment().toString(),
      });
      terminal.last_update = moment(fakeDate).format("YYYY-MM-DD HH:mm:ss");
    }
    await redis.call(
      "JSON.SET",
      "listOfTerminals:1",
      "$",
      JSON.stringify(terminals)
    );
    res.status(200).json(terminals);
  })
);

function isLastUpdateBefore30sec(lastUpdate: string) {
  return moment().diff(moment(lastUpdate), "seconds") < 30 ? 0 : 1;
}

function isLastUpdateBefore8mins(lastUpdate: string) {
  return moment().diff(moment(lastUpdate), "minutes") < 8 ? 0 : 1;
}

app.get(
  "/terminalsStatus",
  asyncHandler(async ({}, res: Response) => {
    const terminals = await redis.call("JSON.GET", "listOfTerminals:1", "$");
    let newTerminals = JSON.parse(terminals as string)[0];
    console.log("new terminals: ", newTerminals);
    for (let terminal of newTerminals) {
      terminal.active =
        terminal.model == 1
          ? isLastUpdateBefore30sec(terminal.last_update)
          : isLastUpdateBefore8mins(terminal.last_update);
    }
    res.status(200).json(newTerminals);
  })
);

app.get(
  "/listjson",
  asyncHandler(async ({}, res: Response) => {
    const result = await redis.call("JSON.GET", "list:1", "$");
    res.status(200).json(JSON.parse(result as string));
  })
);

app.get("/lockedUsers", ({}, res: Response) => {
  res.status(200).send(lockedUsers);
});

app.post("/unlockUser", (req: Request, res: Response) => {
  const { userid } = req.body;

  lockedUsers = lockedUsers.filter((user) => user.id !== userid);

  res.status(200).send(lockedUsers);
});

app.listen(3111, () => {
  console.log("Start Listenning on Port 3111");
});
