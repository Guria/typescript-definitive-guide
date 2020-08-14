# Совместимость объектов

![Chapter Cover](./images/chapter-cover.png)

## Типизация (Object Types) - важно

Пришло время более подробно разобраться в том, как компилятор определяет совместимость объектных типов. Как всегда, вначале, стоит напомнить, что в текущей главе, будет использоваться шаблон ( `: Target = Source` ), о котором, более подробно, шла речь в в самом начале.

Но прежде чем начать погружение в тему _совместимости типов_ (compatible types), будет не лишним заметить, что подобный термин не определен спецификацией _TypeScript_. Тем не менее, в _TypeScript_ описано два типа совместимости. Помимо привычной _совместимости подтипов_ (assignment subtype), также существует _совместимость при присваивании_ (assignment compatibility). Они отличаются только тем, что правила совместимости при присваивании расширяют правила совместимости подтипов. Сделано это по нескольким причинам.

Начать стоит с того, что поведение, типа `any`, не укладывается в рамки, определяемые стандартными правилами. Нестандартное поведение заключается в том, что помимо совместимости всех типов, на основе обычных правил совместимости, с типом `any`, сам тип `any` также совместим со всеми, не являясь их подтипом.

```typescript
// Bird extends Animal

class Animal {
    public name: string;
}
class Bird extends Animal {
    public fly(): void {}
}

let animal: Animal = new Bird(); // Ok
let bird: Bird = new Animal(); // Error -> assignment subtype

// number extends any

let any: any = 0; // Ok
let number: number = any; // Ok -> assignment compatibility
```

Кроме того, поведение двухсторонней совместимости, также наделен и числовой enum.

```typescript
enum NumberEnum {
    A = 1,
}

let v1: number = NumberEnum.A;
let v2: NumberEnum.A = 0;
```

Напоследок стоит вспомнить о совместимости объектного типа, у которого отсутствует объявленное в другом объектном типе необязательный член.

## Типизация (Object Types) - совместимость объектов

Начать тему о совместимости объектных типов, стоит с повторения определения структурной типизации, которая лежит в основе _TypeScript_. Итак, структурная типизация - это механизм сопоставления двух типов по всем признакам их описания. Под признаками понимается как идентификаторы типа, так и типы, которые с ними связаны.Простыми словами, два типа будут считаться совместимыми не потому, что они связаны иерархическим деревом (наследование), а по тому, что в типе `S` ( `: Target = Source`) присутствуют все идентификаторы присутствующие в типе `T`. И при этом, типы с которыми они ассоциированы, совместимы.

```typescript
class Bird {
    public name: string;
}
class Fish {
    public name: string;
}

let bird: Bird;
let fish: Fish;

let v1: Bird = fish; // Ok
let v2: Fish = bird; // Ok
```

В случаях, когда один тип данных, помимо всех признаков второго типа данных, также имеет любые другие, то он будет совместим со вторым типом, но не наоборот. Для обратной совместимости потребуется операция явного преобразования (приведения) типов.

```typescript
class Bird {
    public name: string;
    public age: number;
}
class Fish {
    public name: string;
}

var bird: Bird = new Fish(); // Error
var bird: Bird = new Fish() as Bird; // Ok
let fish: Fish = new Bird(); // Ok
```

Кроме того, два типа, совместимые по признакам идентификаторов, будут совместимы в том случае, если типы ассоциированные с идентификаторами, также совместимы.

```typescript
class Bird {
    public name: string;
    public age: number;
}
class Fish {
    public name: string;
}

class BirdProvider {
    public data: Bird;
}
class FishProvider {
    data: Fish;
}

var birdProvider: BirdProvider = new FishProvider(); // Error
var birdProvider: BirdProvider = new FishProvider() as FishProvider; // Error
let fishProvider: FishProvider = new BirdProvider(); // Ok
```

Методы, объявленные в объектном типе сравниваются не по правилам совместимости объектных типов данных. Про правила проверки функциональных типов, речь пойдет немного позднее (глава [“Типизация - Совместимость функций”]()). Поэтому комментарии к коду будут опущены.

```typescript
class Bird {
    public voice(repeat: number): void {}
}
class Fish {
    public voice(repeat: number, volume: number): void {}
}

let v1: Bird;
let v2: Fish;

let v3: Bird = v2; // Error
let v4: Fish = v1; // Ok
```

Кроме того, не удосужится подробного разбора и пример, в котором происходит проверка типов, содержащих перегруженные методы, так как совместимость их идентична совместимости функциональных типов, которые будут рассмотрены позднее. Сейчас стоит только сказать, что в случаях, когда функция перегружена, проверка на совместимость происходит для каждой из сигнатур. Если существует несколько вариантов перегруженных сигнатур, с которыми может быть совместим тип источник, то выбрана будет та, которая объявлена раньше.

```typescript
class Bird {
    public voice(repeat: number, volume: number): void;
    public voice(repeat: number): void {}
}
class Fish {
    public voice(repeat: number, volume: number): void {}
}

let v1: Bird;
let v2: Fish;

let v3: Bird = v2; // Ok
let v4: Fish = v1; // Ok
```

Типы, которые различаются только необязательными членами, также считаются совместимыми.

```typescript
class Bird {
    public name: string;
    public age?: number;

    public fly?(): void {}
}
class Fish {
    public name: string;
    public arial?: string;

    public swim?(): void {}
}

let bird: Bird;
let fish: Fish;

// class Bird {name: string} === class Fish {name: string}

let v1: Bird = fish; // Ok
let v2: Fish = bird; // Ok
```

Дело в том, что необязательные параметры, в объектных типах, не берутся в расчет при проверке на совместимость. Однако это правило действует только в одну сторону. Тип, который содержит обязательный член, несовместим с типом, у которого идентичный член является необязательным. Такое поведение логично, ведь в случае, когда необязательный член будет отсутствовать, тип, содержащий его, не будет удовлетворять условиям заданным типом с обязательным членом.

```typescript
class Bird {
    public name: string;
    public age?: number;
}
class Fish {
    public name: string;
    public age: number;
}
let bird: Bird;
let fish: Fish;
/**
 * Bird -> name -> search in Fish -> member found -> Fish[ 'name' ] -> Ok
 * Bird -> age -> age is optional member -> skip
 */
let v1: Bird = fish; // Ok
/**
 * Fish -> name -> search in Bird -> member found -> Bird[ 'name' ] -> Ok
 * Fish -> age -> serach in Bird -> member found -> Bird[ 'age' ] isoptional memeber -> Error
 */
let v2: Fish = bird; // Error
let v3: Fish = bird as Fish; // Ok
```

Существует еще одна неочевидность, связанная с необязательными членами. В случае, если в целевом типе все члены объявлены как необязательные, то он будет совместим с любым типом, который частично описывает его, при этом тип источник может описывать любые другие члены. Помимо этого он будет совместим с типом, у которого описание отсутствует вовсе. Но он не будет совместим с типом, у которого описаны только отсутствующие в целевом типе члены. Такое поведение в _TypeScript_ называется _Weak Type Detection_ (обнаружение слабого типа). Типы, описание которых состоит только из необязательных членов, считаются слабыми типами.

```typescript
class IAnimal {
    name?: string;
    age?: number;
}

class Animal {}
class Bird {
    name: string;
}
class Fish {
    age: number;
}
class Insect {
    name: string;
    isLife: boolean;
}
class Reptile {
    age: number;
    isLife: boolean;
}
class Worm {
    isLife: boolean;
}

let animal: Animal;
let bird: Bird;
let fish: Fish;
let insect: Insect;
let reptile: Reptile;
let worm: Worm;

let v1: IAnimal = animal; // Ok
let v2: IAnimal = bird; // Ok
let v3: IAnimal = fish; // Ok
let v4: IAnimal = insect; // Ok
let v5: IAnimal = reptile; // Ok
let v6: IAnimal = worm; // Error
```

Обобщенные типы данных, чьи параметры типа указаны в аннотации типа, и при этом были установлены аргументами типа, участвуют в проверке на совместимость по характерным для _TypeScript_ правилам.

```typescript
class Bird<T> {
    public name: T;
}
class Fish<T, S> {
    public name: T;
    public age: S;
}

let v1: Bird<string>;
let v2: Bird<number>;

let v3: Bird<string> = v2; // Error
let v4: Bird<number> = v1; // Error

let v5: Bird<string>;
let v6: Fish<string, number>;

let v7: Bird<string> = v6; // Ok
let v8: Fish<string, number> = v5; // Error
```

В случаях, когда на совместимость проверяются типы содержащие обобщенные методы, то их сравнение ничем не отличается от сравнения типов содержащие не обобщенные методы.

```typescript
class Bird {
    public voice<T>(repeat: T): void {}
}
class Fish {
    public voice<T, S>(repeat: T, volume: S): void {}
}

let v1: Bird;
let v2: Fish;

let v3: Bird = v2; // Error
let v4: Fish = v1; // Ok
```

На фоне структурной типизации самое неоднозначное поведение возникает тогда, когда описание типов полностью идентично, за исключением их модификаторов доступа. Если в типе описан хоть один член с модификатором доступа отличным от `public`, то он не будет совместим ни с одним типом, независимо от того, какие модификаторы доступа применены к его описанию.

```typescript
class Bird {
    private name: string;
}
class Fish {
    private name: string;
}
class Insect {
    protected name: string;
}
class Reptile {
    public name: string;
}

let v1: Bird;
let v2: Fish;
let v3: Insect;
let v4: Reptile;

let v5: Bird = v2; // Error
let v6: Fish = v1; // Error
let v7: Insect = v1; // Error
let v8: Reptile = v1; // Error
```

К счастью разногласия, возникающие в структурной типизации при совместимости типов определяемых классом, к членам которых применены модификаторы доступа отличные от `public`, не распространяются на номинативную типизацию (глава [“Экскурс в типизацию - Совместимость типов на основе вида типизации”]()), которая может указывать принадлежность к типу через иерархию наследования. Простыми словами, потомки будут совместимы с предками, у которых члены объявлены с помощью модификаторов доступа отличных от `public`.

```typescript
class Bird {
    protected name: string;
}
class Owl extends Bird {
    protected name: string;
}

let bird: Bird;
let owl: Owl;

let v1: Bird = owl; // Ok
let v2: Owl = bird; // Error
let v3: Owl = bird as Owl; // Ok
```

В типах, определяемых классами при проверке на совместимость, не учитываются конструкторы и статические члены (члены класса).

```typescript
class Bird {
    public static readonly DEFAULT_NAME: string = 'bird';

    constructor(name: string) {}
}
class Fish {
    public static toStringDecor(target: string): string {
        return `[object ${target}]`;
    }

    constructor(age: number) {}
}

let v1: Bird;
let v2: Fish;

let v3: Bird = v2; // Ok
let v4: Fish = v1; // Ok
```

Когда в качестве присваиваемого типа выступает экземпляр класса, то для того, чтобы он считался совместим с типом указанным в аннотации, в нем как минимум должны присутствовать все признаки этого типа. Кроме того, он может иметь дополнительные признаки, которые отсутствуют в типе, указанном в аннотации.

```typescript
class Bird {
    public name: string;
}
class Fish {
    public name: string;
    public age: number;
}
class Insect {}

let equal: Bird = new Bird();
let more: Fish = new Fish();
let less: Insect = new Insect();

interface IAnimal {
    name: string;
}

let v1: IAnimal = new Bird(); // Ok -> equal fields
let v2: IAnimal = new Fish(); // Ok -> more fields
let v3: IAnimal = new Insect(); // Error -> less fields
let v4: IAnimal = equal; // Ok -> equal fields
let v5: IAnimal = more; // Ok -> more fields
let v6: IAnimal = less; // Error -> less fields

function f1(p1: IAnimal): void {}

f1(new Bird()); // Ok -> equal fields
f1(new Fish()); // Ok -> more fields
f1(new Insect()); // Error -> less fields

f1(equal); // Ok -> equal fields
f1(more); // Ok -> more fields
f1(less); // Error -> less fields
```

Однако, когда в качестве значения выступает объектный тип, созданный с помощью объектного литерала, поведение в некоторых случаях отличается от поведения присвоения экземпляров класса. В случаях, в которых объект объявляется непосредственно в операции присвоения, он будет совместим с типом указанном в аннотации только если он полностью идентичен. Другими словами, объект создаваемый с помощью объектного литерала не должен содержать ни меньше ни больше членов, чем описано в типе указанном в аннотации (данное поведение можно изменить с помощью опции компилятора `--suppressExcessPropertyErrors` глава [“Опции компилятора”]()).

```typescript
interface IAnimal {
    name: string;
}

function f1(p1: IAnimal): void {}

let equal = { name: '' };
let more = { name: '', age: 0 };
let less = {};

var v1: IAnimal = { name: '' }; // Ok -> equal fields
let v2: IAnimal = { name: '', age: 0 }; // Error-> more fields ...change
let v3: IAnimal = {}; // Error -> less fields
let v4: IAnimal = equal; // Ok -> equal fields
let v5: IAnimal = more; // Ok -> more fields
let v6: IAnimal = less; // Error -> less fields

f1({ name: '' }); // Ok -> equal fields
f1({ name: '', age: 0 }); // Error -> more fields ...change
f1({}); // Error -> less fields

f1(equal); // Ok -> equal fields
f1(more); // Ok -> more fields
f1(less); // Error -> less fields
```

Остается только добавить, что выбор в сторону структурной типизации был сделан по причине того, что подобное поведение очень схоже с поведением самого _JavaScript_, который имеет утиную типизацию. Можно представить удивление _java_ или _C#_ разработчиков, которые впервые увидят структурную типизацию на примере _TypeScript_. Сложно представить выражение лица заядлых теоретиков, когда они увидят, что сущность птицы совместима с сущностью рыбы. Но если угнетать ситуацию, выдумывая нереальные примеры, которые из-за структурной типизации приведут к немыслимым последствиям, то вероятность того, что при разработке возникнет хоть одна ошибка связанная со структурной типизацией, настолько мала, что даже не стоит обращать на это внимание.
