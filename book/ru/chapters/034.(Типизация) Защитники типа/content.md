# Защитники типа

![Chapter Cover](./images/chapter-cover.png)

## Защитники Типа

Помимо того, что _TypeScript_ имеет достаточно мощную систему выявления ошибок на этапе компиляции, разработчики не останавливаясь на достигнутом, безостановочно работая над сведением их к нулю. Существенным шагом к достижению цели, было добавление компилятору возможности, активируемой при помощи флага `--strictNullChecks`, запрещающей неявные операции в которых участвует значение `null` и `undefined`. Простыми словами, компилятор научили во время анализа кода выявлять ошибки, которые могут возникнуть при выполнении операций, в которых фигурирует значения `null` или `undefined`.

Простейшим примером является операция получения элемента из dom-дерева, при помощи метода `querySelector`, который в обычном режиме (с неактивной опцией `--strictNullChecks`) возвращает значение, которое можно присвоить переменной с указанным типом `Element`.

```typescript
const stage: Element = document.querySelector('#stage');
```

Но в строгом режиме (с активной опцией `--strictNullChecks`), метод `querySelector`, возвращает объединенный тип `Element | null`. Тем самым компилятор хочет напомнить разработчику, что в случае отсутствия элемента в dom-дереве, метод `querySelector` возвратит `null`, который может привести к ошибке.

```typescript
const stage: Element | null = document.querySelector('#stage');

function stage_clickHandler(event: MouseEvent): void {}
```

Не будет лишнем напомнить, что на самом деле, метод `querySelector`, возвращает тип `Element | null`, независимо от режима. Дело в том, что в обычном режиме, тип `null` совместим с любыми типами. То есть, в случае отсутствия элемента в dom-дереве, операция присваивания значения `null` переменной с типом `Element`, не приведет к возникновению ошибки.

```typescript
// lib.es6.d.ts
interface NodeSelector {
    querySelector(selectors: string): Element | null;
}
```

Возвращаясь к примеру с получением элемента из dom-дерева стоит сказать, что если раскомментировать строчку кода, в котором происходит подписание элемента на событие, то даже в том случае, если элемент существует, все равно возникнет ошибка на этапе компиляции. Все дело в том, что компилятор TypeScript не позволит вызвать метод `addEventListener` по той причине, что для него объект, на который ссылается переменная, принадлежит к типу `Element` ровно настолько же, насколько он принадлежит к типу `Null`. И это неудивительно, ведь у метода `querySelection` тип возвращаемого значения указан как тип объединение (`Union`).

```typescript
const stage: Element | null = document.querySelector('#stage');
stage.addEventListener('click', stage_clickHandler); // stage is type Element or Null?

function stage_clickHandler(event: MouseEvent): void {}
```

Именно из-за этой особенности или другими словами, неоднозначности, которую вызывает тип `Union`, в `TypeScript` появился механизм, называемый защитниками типа (`Type Guards`).

Защитники типа, это правила, которые помогают выводу типов, определить суженный диапазон типов, для значения принадлежащего к типу `Union`. Другими словами, разработчику предоставлен механизм, позволяющий с помощью выражений, составить логические условия, проанализировав которые, вывод типов, сможет сузить диапазон типов до необходимого, для выполнения операций над значением.

Понятно, что ничего не понятно. Поэтому прежде чем продолжить разбирать определение по шагам, нужно рассмотреть простой пример, который поможет зафиксировать картинку в сознании.

Представим два класса, `Bird` и `Fish` в обоих из которых реализован метод `voice`. Кроме этого, в классе `Bird` реализован метод `fly`, а в классе `Fish`, метод `swim`. Далее представим функцию с единственным параметром, принадлежащему к объединению типов `Bird` и `Fish`.

В теле этой функции без труда получится выполнить операцию вызова метода `voice`, у её параметра, так как этот метод объявлен и в типе `Bird` и в типе `Fish`. Но при попытке вызвать метод `fly` или `swim`, возникает ошибка, так как эти методы не являются общими для обоих типов. Компилятор попросту находится в подвешенном состоянии и не способен самостоятельно определится.

```typescript
class Bird {
    public fly(): void {}
    public voice(): void {}
}
class Fish {
    public swim(): void {}
    public voice(): void {}
}

function move(animal: Bird | Fish): void {
    animal.voice(); // Ok

    animal.fly(); // Error
    animal.swim(); // Error
}
```

Для того чтобы облегчить работу компилятору, _TypeScript_ предлагает процесс,
который сужает множество типов указанных в типе `Union`, до заданного диапазона, а затем закрепляет его за конкретной областью кода. Таким образом, независимо от типа, к которому принадлежит значение, компилятор будет расценивать его, как если бы он принадлежал к диапазону, установленному текущей области.

Но прежде чем диапазон типов будет вычислен и ассоциирован с областью, разработчику необходимо составить условия, включающие в себя признаки, которые недвусмысленно указывают на принадлежность к нужным типам данных.

Из-за того, что анализ происходит на основе логических выражений, область, к которой применяется суженный диапазон типов данных, ограничивается областью, которая выполняется при истинности условия.

Стоит заметить, что от признаков зависит место в котором может находится выражение, а от типов, составляющих множество типа `Union`, зависит способ составления логического условия.

## Сужение диапазона множества типов на основе типа данных

В случаях, в которых для вывода типов, нужно составить условие на основе типов данных, прибегают к помощи, знакомых по _JavaScript_, операторам, `typeof` и `instanceof`.

К помощи оператора `typeof` прибегают тогда, когда хотят установить принадлежность к типам `number`, `string`, `boolean`, `object`, `function`, `symbol` или `undefined`.

Если же значение принадлежит к производному от объекта типу, то установить его принадлежность к типу данных, определяемого классом и находящегося в иерархии наследования, можно при помощи оператора `instanceof`.

Как уже было сказано, с помощью операторов `typeof` и `instanceof` составляется условие, по которому компилятор может вычислить к какому конкретно типу или диапазону типов будет относится значение, в определяемой условием области.

_Пример для оператора typeof_

```typescript
type ParamType =
    | number
    | string
    | boolean
    | object
    | Function
    | symbol
    | undefined;

function identifier(param: ParamType): void {
    param; // param: number | string | boolean | object | Function | symbol | undefined

    if (typeof param === 'number') {
        param; // param: numer
    } else if (typeof param === 'string') {
        param; // param: string
    } else if (typeof param === 'boolean') {
        param; // param: boolean
    } else if (typeof param === 'object') {
        param; // param: object
    } else if (typeof param === 'function') {
        param; // param: Function
    } else if (typeof param === 'symbol') {
        param; // param:symbol
    } else if (typeof param === 'undefined') {
        param; // param: undefined
    }

    param; // param: number | string | boolean | object | Function | symbol | undefined
}
```

_Пример для оператора instenceof_

```typescript
class Animal {
    constructor(public type: string) {}
}
class Bird extends Animal {}
class Fish extends Animal {}
class Insect extends Animal {}

function f(param: Animal | Bird | Fish | Insect): void {
    param; // param: Animal | Bird | Fish | Insect

    if (param instanceof Bird) {
        param; // param: Bird
    } else if (param instanceof Fish) {
        param; // param: Fish
    } else if (param instanceof Insect) {
        param; // param: Insect
    }

    param; // param: Animal | Bird | Fish | Insect
}
```

В случае, когда значение принадлежит к типу `Union`, а выражение состоит из двух операторов, `if` и `else`, значение находящиеся в операторе `else` будет принадлежать к диапазону типов не участвующих в условии `if`.

_Пример для оператора typeof_

```typescript
function f0(param: number | string | boolean): void {
    param; // param: number | string | boolean

    if (typeof param === 'number' || typeof param === 'string') {
        param; // param: number | string
    } else {
        param; // param: boolean
    }

    param; // param: number | string | boolean
}

function f1(param: number | string | boolean): void {
    param; // param: number | string | boolean

    if (typeof param === 'number') {
        param; // param: number
    } else {
        param; // param: string | boolean
    }

    param; // param: number | string | boolean
}
```

_Пример для оператора instanceof_

```typescript
class Animal {
    constructor(public type: string) {}
}
class Bird extends Animal {}
class Fish extends Animal {}
class Insect extends Animal {}
class Bug extends Insect {}

function f0(param: Bird | Fish | Insect): void {
    param; // param: Bird | Fish | Insect

    if (param instanceof Bird) {
        param; // param: Bird
    } else if (param instanceof Fish) {
        param; // param: Fish
    } else {
        param; // param: Insect
    }

    param; // param: Bird | Fish | Insect
}

function f1(param: Animal | Bird | Fish | Insect | Bug): void {
    param; // param: Animal | Bird | Fish | Insect | Bug
    if (param instanceof Bird) {
        param; // param: Bird
    } else if (param instanceof Fish) {
        param; // param: Fish
    } else {
        param; // param: Animal | Insect | Bug
    }

    param; // param: Animal | Bird | Fish | Insect | Bug
}
```

Кроме того, условия можно поместить в тернарный оператор. В этом случае, область на которую распространяется сужение диапазона типов, ограничивается областью, в которой выполняется, соответствующие условию, выражение.

В качестве примера, можно представить функцию, которой, в качестве единственного аргумента, можно передать, как значение принадлежащего к типу `T`, так и функциональное выражение возвращающее значение принадлежащие к типу `T`. Для того, чтобы было проще работать со значением параметра, его нужно сохранить в локальную переменную, которой указан тип `T`. Но прежде, компилятору нужно помочь конкретизировать тип данных, к которому принадлежит значение.

Условие, как и раньше, можно было бы поместить в конструкцию `if`\`else`, но в таких случаях, больше подходит тернарный условный оператор.

Создав условие, в котором значение проверяется на принадлежность к типу отличному от типа `T`, разработчик укажет компилятору, что при выполнении условия, тип параметра будет ограничен типом `Function`, что даст возможность вызвать параметр как функцию. Иначе, значение хранимое в параметре принадлежит к типу `T`.

_Пример для оператора typeof_

```typescript
function f(param: string | (() => string)): void {
    param; // param: string | (() => string)

    let value: string = typeof param !== 'string' ? param() : param;

    param; // param: string | (() => string)
}
```

_Пример для оператора instanceof_

```typescript
class Animal {
    constructor(public type: string = 'type') {}
}

function identifier(param: Animal | (() => Animal)): void {
    param; // param: Animal | (() => Animal)

    let value: Animal = !(param instanceof Animal) ? param() : param;

    param; // param: Animal | (() => Animal)
}
```

Так как оператор `switch` логически похож на оператор `if` \ `else`, то может показаться, что механизм применимый к рассмотренным в этого главе логическим операторам, будет применим и к оператору `switch`. Но на самом деле это не так. Вывод типов, не умеет различать условия, составленные при помощи операторов `typeof` и `instanceof`, в конструкции `switch`.

## Сужение диапазона множества типов на основе признаков присущих типу Tagged Union

Помимо установления принадлежности к типу данных, диапазон типов, составляющих тип Union, можно сузить по признакам, характерных для типа `Tagged Union`.

Условия, составленные на основе идентификаторов варианта, можно использовать во всех условных операторах, включая `switch`.

_Пример для оператора if\esle_

```typescript
enum AnimalTypes {
    Animal = 'animal',
    Bird = 'bird',
    Fish = 'fish',
}

class Animal {
    readonly type: AnimalTypes = AnimalTypes.Animal;
}
class Bird extends Animal {
    readonly type: AnimalTypes.Bird = AnimalTypes.Bird;

    public fly(): void {}
}
class Fish extends Animal {
    readonly type: AnimalTypes.Fish = AnimalTypes.Fish;

    public swim(): void {}
}

function move(param: Bird | Fish): void {
    param; // param: Bird | Fish

    if (param.type === AnimalTypes.Bird) {
        param.fly();
    } else {
        param.swim();
    }

    param; // param: Bird | Fish
}
```

_Пример для тернарного оператора ( ?: )_

```typescript
function move(param: Bird | Fish): void {
    param; // param: Bird | Fish

    param.type === AnimalTypes.Bird ? param.fly() : param.swim();

    param; // param: Bird | Fish
}
```

_Пример для оператора switch_

```typescript
enum AnimalTypes {
    Animal = 'animal',
    Bird = 'bird',
    Fish = 'fish',
}

class Animal {
    readonly type: AnimalTypes = AnimalTypes.Animal;
}
class Bird extends Animal {
    readonly type: AnimalTypes.Bird = AnimalTypes.Bird;

    public fly(): void {}
}
class Fish extends Animal {
    readonly type: AnimalTypes.Fish = AnimalTypes.Fish;

    public swim(): void {}
}

function move(param: Bird | Fish): void {
    param; // param: Bird | Fish

    switch (param.type) {
        case AnimalTypes.Bird:
            param.fly(); // Ok
            break;

        case AnimalTypes.Fish:
            param.swim(); // Ok
            break;
    }

    param; // param: Bird | Fish
}
```

В случаях, когда множество типа `Union` составляют тип `null` и/или `undefined`, а также только один конкретный тип, для вывода типа, будет достаточно условия, подтверждающего существование значения, отличного от `null` и/или `undefined`.

Это очень распространенный случай при активной опции `--strictNullChecks`. Условие, с помощью которого вывод типов сможет установить принадлежность значения к типам, отличными от `null` и/или `undefined`, может использоваться совместно с любыми условными операторами.

_Пример с оператором if\else_

```typescript
function f(param: number | null | undefined): void {
    param; // param: number | null | undefined

    if (param !== null && param !== undefined) {
        param; // param: number
    }

    // or

    if (param) {
        param; // Param: number
    }

    param; // param: number | null | undefined
}
```

_Пример с тернарным оператором ( ?: )_

```typescript
function f(param: number | null | undefined): void {
    param; // param: number | null | undefined

    var value: number = param ? param : 0;
    var value: number = param || 0;

    param; // param: number | null | undefined
}
```

_Пример с оператором switch_

```typescript
function identifier(param: number | null | undefined): void {
    param; // param: number | null | undefined

    switch (param) {
        case null:
            param; // param: null
            break;

        case undefined:
            param; // param: undefined
            break;

        default: {
            param; // param: number
        }
    }

    param; // param: number | null | undefined
}
```

Кроме этого, при активной опции `--strictNullChecks`, в случаях, в которых значение принадлежит к объектному типу, вывод типов может заменить оператор `Not-Null Not-Undefined`. Для этого нужно составить условие, в котором будет проверяться обращение к членам, в случае отсутствия которых может возникнуть ошибка.

_Пример с Not-Null Not-Undefined (с учетом активной опции --strictNullChecks)_

```typescript
class Ability {
    public fly(): void {}
}

class Bird {
    public ability: Ability | null = new Ability();
}

function move(animal: Bird | null | undefined): void {
    animal.ability; // Error, Object is possibly 'null' or 'undefined'
    animal!.ability; // Ok
    animal!.ability.fly(); // Error, Object is possibly 'null' or 'undefined'
    animal!.ability!.fly(); // Ok
}
```

_Пример с защитником типа (с учетом активной опции --strictNullChecks)_

```typescript
class Ability {
    public fly(): void {}
}

class Bird {
    public ability: Ability | null = new Ability();
}

function move(animal: Bird | null | undefined): void {
    if (animal && animal.ability) {
        animal.ability.fly(); // Ok
    }
}
```

## Сужение диапазона множества типов на основе доступных членов объекта

Сужение диапазона типов также возможно на основе доступных (`public`) членов присущих типам составляющих диапазон (`Union`). Сделать это можно с помощью оператора `in`.

```typescript
class A {
    public a: number = 10;
}
class B {
    public b: string = 'text';
}
class C extends A {}

function f0(p: A | B) {
    if ('a' in p) {
        return p.a; // p: A
    }

    return p.b; // p: B
}

function f1(p: B | C) {
    if ('a' in p) {
        return p.a; // p: C
    }

    return p.b; // p: B
}
```

## Сужение диапазона множества типов на основе функции определенной пользователем

Все перечисленные ранее способы работают только в том случае, если проверка происходит в месте, отведенном под условие. Другими словами, с помощью перечисленных до этого момента способов, условие проверки, нельзя вынести в отдельный блок кода (функцию). Это могло бы сильно ударить по семантической составляющей кода, а также нарушить принцип разработки программного обеспечения, который призван бороться с повторением кода (_Don’t repeat yourself, DRY_ (не повторяйся)). Но к счастью для разработчиков, создатели _TypeScript_ реализовали возможность определять пользовательские защитники типа.

В роли пользовательского защитника может выступать функция, функциональное выражение или метод, которая обязательно должна возвращать значение принадлежащие к типу `boolean`. Для того чтобы вывод типов понял, что вызываемая функция не является обычной функцией, которая возвращает значение булева типа, у функции вместо типа возвращаемого значения указывают предикат (предикат, это логическое выражение, значение которого может быть либо истинным (`true`), либо ложным (`false`)).

Выражение предиката состоит из трех частей и имеет следующий вид `identifier is Type`.

Первым членом выражения является идентификатор, который обязан совпадать с идентификатором одного из параметров, объявленных в сигнатуре функции. В случае, когда предикат указан методу экземпляра класса, в качестве идентификатора может быть указано ключевое слово `this`.

Стоит отдельно упомянуть, что ключевое слово `this` можно указывать только методам, объявленным в конструкциях объявленных при помощи ключевых слов `class` и `interface`. При попытке указать ключевое слово `this` в предикате функционального выражения, ссылку на которое присваивается свойству `prototype`, функции конструктора, либо же в методе объявленного в объекте созданного с помощью литерала объекта, возникнет ошибка.

_Пример с функцией конструктором_

```typescript
function Constructor() {}

Constructor.prototype.validator = function (): this is Object {
    // Error
    return true;
};
```

_Пример с литералом объекта_

```typescript
interface IPredicat {
    validator(): this is Object; // Ok
}

var object: IPredicat = {
    // Ok
    validator(): this is Object {
        // Error
        return this;
    },
};

var object: { validator(): this is Object } = {
    // Error
    validator(): this is Object {
        // Error
        return this;
    },
};
```

Ко второму члену выражения относится ключевое слово `is` которое служит в качестве утверждения.

В качестве третьего члена выражения может выступать любой тип данных.

_Пример предиката функции (function)_

```typescript
function isT1(p1: T1 | T2 | T3): p1 is T1 {
    return p1 instanceof T1;
}

function identifier(p1: T1 | T2 | T3): void {
    if (isT1(p1)) {
        p1; // p1: T1
    }
}
```

_Пример предиката функционального выражения (functional expression)_

```typescript
const isT2 = (p1: T1 | T2 | T3): p1 is T2 => p1 instanceof T2;

function identifier(p1: T1 | T2 | T3): void {
    if (isT2(p1)) {
        p1; // p1: T2
    }
}
```

_Пример предиката метода класса (static method)_

```typescript
class Validator {
    public static isT3(p1: T1 | T2 | T3): p1 is T3 {
        return p1 instanceof T3;
    }
}

function identifier(p1: T1 | T2 | T3): void {
    if (Validator.isT3(p1)) {
        p1; // p1: T3
    }
}
```

Условие, на основании которого, разработчик определяет принадлежность одного из параметров к конкретному типу данных, не ограничено никакими конкретными правилами. Исходя из результата выполнения условия, истина (`true`) или ложь (`false`), вывод типов сможет установить принадлежность указанного параметра к указанному типу данных.

```typescript
class Animal {}
class Bird extends Animal {
    public fly(): void {}
}
class Fish extends Animal {
    public swim(): void {}
}
class Insect extends Animal {
    public crawl(): void {}
}

class AnimalValidator {
    public static isBird(animal: Animal): animal is Bird {
        return animal instanceof Bird;
    }

    public static isFish(animal: Animal): animal is Fish {
        return (animal as Fish).swim !== undefined;
    }

    public static isInsect(animal: Animal): animal is Insect {
        let isAnimalIsNotUndefinedValid: boolean = animal !== undefined;
        let isInsectValid: boolean = animal instanceof Insect;

        return isAnimalIsNotUndefinedValid && isInsectValid;
    }
}

function move(animal: Animal): void {
    if (AnimalValidator.isBird(animal)) {
        animal.fly();
    } else if (AnimalValidator.isFish(animal)) {
        animal.swim();
    } else if (AnimalValidator.isInsect(animal)) {
        animal.crawl();
    }
}
```

Последнее о чем осталось упомянуть, что в случае, если по условию значение не подойдет не по одному из признаков, то вывод типов установит ему принадлежность к типу данных `never`.

```typescript
class Animal {
    constructor(public type: string) {}
}
class Bird extends Animal {}
class Fish extends Animal {}

function move(animal: Bird | Fish): void {
    if (animal instanceof Bird) {
        animal; // animal: Bird
    } else if (animal instanceof Fish) {
        animal; // animal: Fish
    } else {
        animal; // animal: never
    }
}
```
