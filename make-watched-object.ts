type PropEventSource<Type> = {
  on<Key extends string & keyof Type>(
    eventName: `${Key}Changed`,
    callback: (newValue: Type[Key], oldValue: Type[Key]) => void
  ): void;
};

function makeWatchedObject<Type>(obj: Type): Type & PropEventSource<Type> {
  const cache = new Map<
    string | symbol,
    (
      newValue: Type[string & keyof Type],
      oldValue: Type[string & keyof Type]
    ) => void
  >();

  const on = <Key extends string & keyof Type>(
    change: string | symbol,
    callback: (newValue: Type[Key], oldValue: Type[Key]) => void
  ) => {
    cache.set(
      typeof change === "string" ? change.replace("Changed", "") : change,
      callback as (
        newValue: Type[string & keyof Type],
        oldValue: Type[string & keyof Type]
      ) => void
    );
  };

  return new Proxy<Type & PropEventSource<Type>>(
    {
      ...obj,
      on: on,
    },
    {
      set: <Key extends string & keyof Type>(
        target: Type,
        p: Key,
        newValue: Type[Key]
      ) => {
        cache.get(p)?.(newValue, target[p]);
        return true;
      },
    }
  );
}

function watchAllProperties<T>(obj: T & PropEventSource<T>) {
  Object.keys(obj).forEach((key) =>
    obj.on(`${key as string & keyof T}Changed`, (newValue, oldValue) => {
      console.log(
        `${key} changed from ${JSON.stringify(oldValue)} to ${JSON.stringify(
          newValue
        )}`
      );
    })
  );
}

type Person = {
  name: string;
  age: number;
  location: { lan: number; log: number };
};

const person = makeWatchedObject<Person>({
  name: "Lydia",
  age: 21,
  location: { lan: 0, log: 0 },
});

type PropEventCallback<Type, Key extends string & keyof Type> = (
  newValue: Type[Key],
  oldValue: Type[Key]
) => void;

const locationChangeHandler: PropEventCallback<Person, "location"> = (
  newValue: Person["location"],
  oldValue: Person["location"]
) => {
  console.log(
    `location changed from ${JSON.stringify(oldValue)} to ${JSON.stringify(
      newValue
    )}`
  );
};

person.on("locationChanged", locationChangeHandler);

person.location = { lan: 1, log: 1 };
