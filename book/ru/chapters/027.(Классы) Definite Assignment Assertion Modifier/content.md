# Definite Assignment Assertion Modifier

![Chapter Cover](./images/chapter-cover.png)

## Классы - Definite Assignment Assertion Modifier

Для того, чтобы повысить типобезопасность программы, рекомендуют вести разработку с активной опцией `--strict` (глава [“Опции компилятора”]()), которая активирует множество других опций, изменяющих поведение компилятора, заставляя разработчиков писать код сводящий к минимуму ошибки на этапе выполнения. Это привело к созданию такой опции, как `--strictPropertyInitialization`, которая при активной опции `--strictNullChecks`, запрещает классу иметь поля, типам которых явно не указана принадлежность к типу Undefined и которые не были инициализированы в момент его создания. Таким образом предотвращается обращение к полям, которые могут иметь значение `undefined`.

```typescript
class Identifier {
    public a: number = 0; // Ok, инициализация при объявлении
    public b: number; // Ok, инициализация в конструкторе
    public c: number | undefined; // Ok, явное указание принадлежности к типу Undefined
    public d: number; // Error, инициализация отсутствует

    constructor() {
        this.b = 0;
    }
}
```

Но бывают случаи, при которых условия, устанавливаемые опцией `--strictPropertyInitialization`, не могут быть удовлетворены в полной мере. К самым распространенным случаям, можно отнести установку значений полей с помощью _DI_ (dependency injection), инициализация вынесенная в методы, так называемого, жизненного цикла, а также методы инициализации, выполняемые из конструктора класса.

```typescript
// инициализация с помощью DI
class A {
    @Inject(Symbol.for('key'))
    public field: number; // Error
}
```

```typescript
// метод жизненного цикла из angular
class B {
    private field: number; // Error

    public ngOnInit(): void {
        this.field = 0;
    }
}
```

```typescript
// инициализация вне конструктора
class C {
    private field: number; // Error

    constructor() {
        this.init();
    }

    private init(): void {
        this.field = 0;
    }
}
```

Для таких случаев синтаксис _TypeScript_ был введен модификатор _definite assignment assertion modifier_, который указывается с помощью символа восклицательного знака (`!`), располагаемого после идентификатора поля или переменной.

```typescript
class Identifier {
    public identifier!: Type;
}

//or

let identifier!: Type;
```

Применяя модификатор _definite assignment assertion modifier_, разработчик сообщает компилятору, что берет ответственность за инициализацию поля на себя.

```typescript
// инициализация с помощью DI
class A {
    @Inject(Symbol.for('key'))
    public field!: number; // Ok
}
```

```typescript
// метод жизненного цикла из angular
class B {
    private field!: number; // Ok

    public ngOnInit(): void {
        this.field = 0;
    }
}
```

```typescript
// инициализация вне конструктора
class C {
    private field!: number; // Ok

    constructor() {
        this.init();
    }

    private init(): void {
        this.field = 0;
    }
}
```
