# Модификатор readonly

![Chapter Cover](./images/chapter-cover.png)

## Модификатор readonly (только для чтения)

В _TypeScript_ существует модификатор, с помощью которого поле объекта помечается, как _“только для чтения”_.

Модификатор, запрещающий изменение значений полей объектов указывается с помощью ключевого слова `readonly`. Модификатор `readonly` применяется к полям как при их объявлении в классе, так и при их описании в интерфейсе.

```typescript
interface IAnimal {
    readonly name: string;
}

class Animal {
    public readonly name: string = 'name';
}
```

Если при описании интерфейса поле было помечено, как `readonly`, то классам, реализующим этот интерфейс, не обязательно указывать модификатор `readonly`. Но в таком случае значение поля будет изменяемым.

```typescript
interface IAnimal {
    readonly name: string;
}

class Bird implements IAnimal {
    public readonly name: string = 'bird'; // Ok
}

class Fish implements IAnimal {
    public name: string = 'fish'; // Ok
}

let bird: Bird = new Bird();
bird.name = 'newbird'; // Error

let fish: Fish = new Fish();
fish.name = 'newfish'; // Ok
```

Это правило работает и в обратном направлении. То есть поле, описанное в интерфейсе без указания модификатора `readonly`, может быть помечено этим модификатором при реализации.

```typescript
interface IAnimal {
    name: string;
}

class Bird implements IAnimal {
    public readonly name: string = 'bird'; // Ok
}

let bird: Bird = new Bird();
bird.name = 'newbird'; // Error
```

Модификатор `readonly` можно применять к свойствам, объявленным, как параметры.

```typescript
interface IAnimal {
    name: string;
}

class Bird implements IAnimal {
    constructor(public readonly name: string) {}
}

let bird: Bird = new Bird('bird');
```

В случае применения модификатора `readonly` к свойствам объявленным как параметры, модификаторы доступа можно не указывать.

```typescript
interface IAnimal {
    name: string;
}

class Bird implements IAnimal {
    constructor(readonly name: string) {}
}

let bird: Bird = new Bird('bird');
```

Кроме того, полю, к которому применен модификатор `readonly`, не обязательно присваивать значение в момент объявления. Но в таком случае, присвоить значение полю, помеченному _“только для чтения”_, можно будет только из конструктора класса, в котором это поле объявлено. Поле, которому не было присвоено значение, и к которому применен модификатор `readonly`, так же как и любое другое неинициализированное поле, имеет значение `undefined`.

```typescript
interface IAnimal {
    readonly name: string;
}

class Animal implements IAnimal {
    public readonly name: string; // Ok

    constructor() {
        this.name = 'animal'; // Ok
    }
}
```

Попытка присвоить значение полю, к которому применен модификатор `readonly`, в месте, отличном от места объявления или конструктора класса, в котором это поле объявлено, приведет к возникновению ошибки.

```typescript
interface IAnimal {
    readonly name: string;
}

class Animal implements IAnimal {
    public readonly name: string; // Ok

    public setName(name: string): void {
        this.name = name; // Error
    }
}
```

Не получится избежать возникновения ошибки и при попытке присвоить значение из конструктора класса-потомка, с условием, что потомок не переопределяет его.

```typescript
interface IAnimal {
    readonly name: string;
    readonly age: number;
}

class Animal implements IAnimal {
    public readonly name: string; // Ok
    public readonly age: number; // Ok
}

class Bird extends Animal {
    public readonly age: number; // override field

    constructor() {
        super();
        super.name = 'bird'; // Error
        this.age = 0; // Ok
    }
}
```

Поля объекта, созданного с помощью литерала объекта, невозможно будет изменить, если в связанном с ним типе к этим полям применен модификатор `readonly`.

```typescript
interface IAnimal {
    readonly name: string;
}

let animal: IAnimal = { name: 'animal' };

animal.name = 'newanimal'; // Error
```

Если полям, помеченным _“только для чтения”_, не указан тип данных, а присвоение примитивного значения происходит в месте объявления, то для таких полей вывод типов укажет принадлежность к литеральному типу.

```typescript
class Animal {
    public readonly nameReadonly = 'animal'; // nameReadonly: "animal"
    public nameDefault = 'animal'; // nameDefault: string

    public readonly ageReadonly = 0; // ageReadonly: 0
    public ageDefault = 0; // ageReadonly: number

    public readonly isLifeReadonly = true; // isLifeReadonly: true
    public isLifeDefault = true; // isLifeDefault: boolean
}
```
