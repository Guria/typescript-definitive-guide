# Оператор keyof, Lookup Types, Mapped Types, Mapped Types - префиксы + и -
## Оператор keyof, Lookup Types, Mapped Types, Mapped Types - префиксы + и -


Для того, чтобы повысить уровень выявления ошибок и при этом сократить время разработки программы, создатели *TypeScript* не прекращают радовать разработчиков добавлением новых возможностей для взаимодействия с типами данных. Благодаря усилиям разработчиков со всего земного шара, стало осуществимо получать объединенный тип, состоящий как из ключей, так и из значений описания типов данных. Кроме этого, стало возможно итерировать типы данных.


## Запрос ключей keyof



В *TypeScript* существует возможность выводить все публичные не статические принадлежащие типу ключи и на их основе создавать литеральный объединенный тип (`Union`). Для получения ключей нужно указать оператор `keyof`, после которого указан тип данных, чьи ключи будут объединены в тип `Union - keyof Type`.

Оператор `keyof` может применяться к любому типу данных.

`````ts
type AliasType = { f1: number, f2: string };

interface IInterfaceType {
  f1: number;
  f2: string;
}

class ClassType {
  f1: number;
  f2: string;
}

let v1: keyof AliasType; // v1: "f1" | "f2"
let v2: keyof IInterfaceType; // v2: "f1" | "f2"
let v3: keyof ClassType; // v3: "f1" | "f2"
let v4: keyof number; // v4: "toString" | "toFixed" | "toExponential" | "toPrecision" | "valueOf" | "toLocaleString"
`````

Как уже было замечено, оператор `keyof` выводит только публичные не статические ключи типа.

`````ts
class Type {
    public static fieldClass: number;
    public static methodClass(): void {}
    
    private privateField: number;
    protected protectedField: string;
    public publicField: boolean;

    public constructor() {}

    public get property(): number { return NaN; }
    public set property(value: number) {}
    public instanceMethod(): void {}
}

let v1: keyof Type; // a: "publicField" | "property" | "instanceMethod"
`````

В случае, если тип данных не содержит публичных ключей, оператор `keyof` выведет тип `never`.

`````ts
type AliasType = {};

interface IInterfaceType {}

class ClassType {
    private f1: number;
    protected f2: string;
}

let v1: keyof AliasType; // v1: never
let v2: keyof IInterfaceType; // v2: never
let v3: keyof ClassType; // v3: never
let v4: keyof object; // v4: never
`````

Оператор `keyof` также может использоваться в объявлении обобщенного типа данных. Точнее, с помощью оператора `keyof` можно получить тип, а затем расширить его параметром типа. Важно понимать, что в качестве значения по умолчанию может выступать только тип, совместимый с объединенным типом, полученным на основе ключей.

`````ts
function f1<T, U extends keyof T = keyof T>(): void {}
`````

Напоследок стоит упомянуть об одном не очевидном моменте: оператор `keyof` можно совмещать с оператором `typeof` (Type Queries).

`````ts
class Animal {
    public name: string;
    public age: number;
}

let animal = new Animal();

let type: typeof animal; // type: { name: string; age: number; }
let union: keyof typeof animal; // union: "name" | "age"
`````


## Поиск типов (Lookup Types)


Если оператор `keyof` выбирает все доступные ключи, то с помощью поиска типов можно получить заданные типы по известным ключам. Получить связанный с ключом тип можно с помощью скобочной нотации, в которой через оператор вертикальная черта `|` будут перечислены от одного и более ключа, существующего в типе. В качестве типа данных могут выступать только интерфейсы, классы и в ограниченных случаях операторы типа.

В случаях, когда в качестве типа данных выступает интерфейс, то получить можно все типы, без исключения. При попытке получить тип несуществующего ключа возникнет ошибка.

`````ts
interface IInterfaceType {
    p1: number;
    p2: string;
}

let v1: IInterfaceType['p1']; // v1: number
let v2: IInterfaceType['p2']; // v2: string
let union: IInterfaceType['p1' | 'p2']; // union: number | string
let notexist: IInterfaceType['notexist']; // Error -> Property 'notexist' does not exist on type 'IAnimal'
`````

Если в качестве типа выступает класс, то получить типы можно только у членов его экземпляра. При попытке получить тип несуществующего члена возникнет ошибка.

`````ts
class ClassType {
    public static publicFieldClass: number;
    
    public publicInstanceField: number;
    protected protectedInstanceField: string;
    private privateInstanceField: boolean;
    
    public get propertyInstance(): number { return NaN; }
    public set propertyInstance(value: number) {}
    
    public methodInstance(): void {}
}

let publicFieldClass: ClassType['publicFieldClass']; // Error

let publicFieldInstance: ClassType['publicInstanceField']; // publicFieldInstance: number
let protectedFieldInstance: ClassType['protectedInstanceField']; // protectedFieldInstance: string
let privateFieldInstance: ClassType['privateInstanceField']; // privateFieldInstance: boolean
let propertyInstance: ClassType['propertyInstance']; // propertyInstance: number
let methodInstance: ClassType['methodInstance']; // methodInstance: () => void

let notexist: ClassType['notexist']; // Error
`````

Нельзя переоценить вклад возможностей поиска типов, которые пришлись на динамическую часть типизированного мира *TypeScript*. Благодаря поиску типов в паре с оператором keyof появилась возможность, позволяющая выводу типов устанавливать связь между динамическими ключами и их типами. Это в свою очередь позволяет производить дополнительные проверки, которые повышают *“типобезопасность”* кода.

`````ts
class Model<T> {
    constructor(private entity: T) {}
    
    public getValueByName<U extends keyof T>(key: U): T[U] {
        return this.entity[key];
    }
}

interface IAnimalModel {
    id: string;
    age: number;
}

let json = '"{"id": "animal", "age": 0}"';
let entity: IAnimalModel = JSON.parse(json);

let userModel: Model<IAnimalModel> = new Model(entity);

let id = userModel.getValueByName('id'); // id: string
let age = userModel.getValueByName('age'); // age: number
`````


## Сопоставление типов (Mapped Types)


Сопоставленные типы — это типы данных, которые при помощи механизма итерирования модифицируют лежащие в основе конкретные типы данных.

В `TypeScript` существует возможность определения типа данных, в качестве ключей которого выступает множество, элементами которого являются литеральные строковые типы данных, в том числе и составляющие тип объединение (`Union`). Подобные типы обозначаются как *сопоставленные типы* данных (`Mapped Types`) и определяются исключительно на основе псевдонимов типов (`Type Alias`), объявление которых осуществляется при помощи ключевого слова `type`. Тело сопоставимого типа, заключенное в фигурные скобки `{}`, включает в себя одно единственное выражение, состоящие из двух частей, разделенных двоеточием. 

`````ts
type СопоставимыйТип = {
    ЛеваяЧастьВыражения: ПраваяЧастьВырыжения;
}
`````

В левой части выражения располагается обрамленное в квадратные скобки `[]` выражение, предназначенное для работы с множеством, а в правой части определяется произвольный тип данных.

`````ts
type СопоставимыйТип = {
    [ВыражениеДляРаботыСМножеством]: ПроизвольныйТипДанных;
}
`````

Выражение для работы со множеством определяет механизм, предназначенный для итерирования элементами этого множества, и также состоит из двух частей, разделенных оператором `in` (`[ЛевыйОперанд in ПравыйОпернад]`). В качестве левого операнда указывается произвольный идентификатор, которому в процессе итерирования элементами множества, указанного в качестве правого операнда, последовательно будет присвоено их строковое представление (`[ПроизвольныйИдентификатор in Множество]`). 


`````ts
type СопоставимыйТип = {
    [ПроизвольныйИдентификатор in Множество]: ПроизвольныйТипДанных;
}
`````

Как уже было сказано, в роли идентификатора может выступать любой идентификатор.

`````ts
type СопоставимыйТип = {
    [Key in Множество]: ПроизвольныйТипДанных;
}

// или

type СопоставимыйТип = {
    [K in Множество]: ПроизвольныйТипДанных;
}
`````

Множество может быть определенно как единственным литеральным строковым типом (`"ElementLiteralStringType"`), так и его множеством, составляющим тип объединение (`Union Type`) (`"FirstElementLiteralStringType" | "SecondElementLeteralStringType"`).

`````ts
// множество с одним элементом
type СопоставимыйТип = {
    [K in "FirstLiteralStringType"]: ПроизвольныйТипДанных;
}

// или 

// множество с несколькими элементами
type СопоставимыйТип = {
    [K in "FirstLiteralStringType" | "SecondLiteralStringType"] : ПроизвольныйТипДанных;
}

// или 

type LiteralStringType = "FirstLiteralStringType" | "SecondLiteralStringType";

// множество с несколькими элементами вынесенных в тип Union
type СопоставимыйТип = {
    [K in LiteralStringType]: ПроизвольныйТипДанных;
}
`````

Результатом определения сопоставленного типа является объектный тип, состоящий из ключей (строковым представлением элементов множества), ассоциированных с произвольным типом.

`````ts
type ABC = "a" | "b" | "c";

type ABCWithString = {
    [K in ABC]: string;
}

// или

type ABCWithNumber = {
    [K in ABC]: number;
}

declare function abcWithString(params: ABCWithString): void;

abcWithString({a: '', b: '', c: ''}); // Ok
abcWithString({}); // Error, missing properties 'a', 'b', 'c'
abcWithString({a: '', b: ''}); // Error, missing property 'c'
abcWithString({a: '', b: '', c: 5}); // Error, type number is not type string

declare function abcWithNumber(params: ABCWithNumber): void;

abcWithNumber({a: 0, b: 0, c: 0}); // Ok
abcWithNumber({}); // Error, missing properties 'a', 'b', 'c'
abcWithNumber({a: 0, b: 0}); // Error, missing property 'c'
abcWithNumber({a: 0, b: 0, c: ''}); // Error, type string is not type number
`````

От статического указания итерируемого типа мало пользы, поэтому `Mapped Types` лучше всего раскрывают свой потенциал при совместной работе с известными к этому моменту запросом ключей (`keyof`) и поиском типов (`Lookup Types`,) оперирующих параметрами типа (`Generics`).

`````ts
type MappedType<T> = {
    [K in keyof T]: T[K];
}

// или

type MappedType<T, U extends keyof T> = {
    [K in U]: T[K];
}
`````

В первом случае в выражении `[P in keyof T]: T[P];` первым действием выполняется вычисление оператора `keyof` над параметром типа `T`. В его результате ключи произвольного типа преобразуются во множество, то есть в тип `Union`, элементы которого принадлежат к литеральному строковому типу данных. Простыми словами операция `keyof T` заменяется на только что полученный тип `Union` `[P in Union]: T[P];`, над которым на следующим действии выполняется итерация.

Во втором случае `MappedType<T, U extends keyof T>` оператор `keyof` также преобразует параметр типа `T` в тип `Union`, который затем расширяет параметр типа `U`, тем самым получая все его признаки, необходимые для итерации в выражении `[K in U]`.

С полученным в итерации `[K in U]` ключом `K` ассоциируется тип данных, который был ассоциирован с ним в исходным типе и который вычисляется с помощью механизма поиска типов `T[K]`. 

Совокупность описанных механизмов позволяет создавать новый тип, идентичный исходному, что при включении в условие определения `Mapped Type` модификаторов, как например `readonly` или `?:`, позволяет определять новые модифицирующие типы данных.

`````ts
type ReadonlyMember<T> = {
    readonly [P in keyof T]: T[P];
}

interface IAnimal {
    name: string;
    age: number;
}

let animal: ReadonlyMember<IAnimal>;  // animal: { readonly name: string; readonly age: number; }
`````

Как уже было замечено, в правой части выражения можно указать любой тип данных, в том числе и объединенный тип, в состав которого войдет тип, полученный при помощи поиска типов.

`````ts
type Nullable<T> = {
    [P in keyof T]: T[P] | null;
}

type Stringify<T> = {
    [P in keyof T]: string;
}

interface IAnimal {
    name: string;
    age: number;
}

let nullable: Nullable<IAnimal>; // { name: string | null; age: number | null; }
let stringify: Stringify<IAnimal>; // { name: string; age: string; }
`````

Сопоставленные типы не могут содержать более одной итерации в типе, а также не могут содержать объявление других членов.

`````ts
type AliasType<T, U> = {
    [P in keyof T]: T[P]; // Ok
    [V in keyof U]: U[V]; // Error
    f1: number; // Error
}
`````

К тому же в *TypeScript* существует несколько готовых типов, таких как `Readonly<T>`, `Partial<T>`, `Record<K, T>` и `Pick<T, K>` (глава [“Расширенные типы - Readonly, Partial, Required, Pick, Record”](../044.(Расширенные%20типы)%20Readonly,%20Partial,%20Required,%20Pick,%20Record)).


Кроме того сопоставленные типы вместе с _шаблонными литеральными строковыми типами_ способны переопределить исходные ключи при помощи ключевого слова `as` указываемого после строкового перечисления.

`````ts
type T = {
    [K in STRING_VALUES as NEW_KEY]: K // K преобразованный
}
`````

Таким образом совмещая данный механизм с _шаблонными литеральными строковыми типами_ можно добиться переопределения исходных ключей.

`````ts
type ToGetter<T> = `get${capitalize T}`;
type Getters<T> = {
    [K in keyof T as ToGetter<K>]: () => T[K];
}

type Person = {
    name: string;
    age: number;
}

/**
 * type T = {
 *  getName: () => string;
 *  getAge: () => number;
 * }
 */
type T = Getters<Person>
````` 


## Префиксы + и - в сопоставленных типах


Сопоставленные типы позволяют добавлять модификаторы, но не позволяют их удалять, что в свою очередь имеет большое значение в случае с гомоморфными типами, которые по умолчанию сохраняют модификаторы своего базового типа (гомоморфные типы будут рассмотрены в главе [“Расширенные типы - Readonly, Partial, Required, Pick, Record”](../044.(Расширенные%20типы)%20Readonly,%20Partial,%20Required,%20Pick,%20Record)). 

Для разрешения этого к модификаторам в типах сопоставления были добавлены префиксы `+` и `-`, с помощью которых указывается поведение модификатора — добавить или удалить.

`````ts
type AddModifier<T> = { 
    +readonly [P in keyof T]+?: T[P]; // добавит модификаторы readonly и ? (optional)
}; 
type RemoveModoifier<T> = { 
    -readonly [P in keyof T]-?: T[P]; // удалит модификаторы readonly и ? (optional)
}; 

interface IWithoutModifier { field: string; }
interface IWithModifier { readonly field?: string; }

/**
 * Добавление модификаторов
 * было { field: string; }
 * стало { readonly field?: string; }
 */
let addingModifier: AddModifier<IWithoutModifier> = { field: '' };
let withoutModifier: IWithoutModifier = { field: '' };

addingModifier.field = ''; // Error
withoutModifier.field = ''; // Ok

/**
 * Удаление модификаторов
 * было { readonly field?: string; }
 * стало { field: string; }
 */
let removingModifier: RemoveModoifier<IWithModifier> = { field: '' };
let withModifier: IWithModifier = { field: '' };

removingModifier.field = ''; // Ok
withModifier.field = ''; // Error
`````
