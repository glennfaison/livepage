# LivePage

This is the project glossary for LivePage: a dedicated reference for entities, relationships, and domain language in the app.

## Language

**App state**:
The shared in-memory representation of the current page builder document.
_Avoid_: State, store, data model

**App-state API**:
The boundary for reading from and mutating app state through explicit commands and selectors.
_Avoid_: Facade, helper layer

**Serializers**:
Modules that transform app state to and from external formats such as JSON, shortcode, and HTML.
_Avoid_: Exporters, importers

**Data source**:
An external provider that supplies data to a design component.
_Avoid_: Connection

**Placeholder**:
A runtime token embedded in a component string and replaced before rendering.
_Avoid_: Template marker

**Data-source placeholder**:
A placeholder whose value comes from a data source.
_Avoid_: Connection placeholder

**Computable placeholder**:
A placeholder whose value is derived at runtime, such as the current date.
_Avoid_: Dynamic token

## Relationships

- The **App-state API** operates on **App state**
- **Serializers** read from or write to **App state**
- **Placeholders** are resolved inside component strings before rendering

## Example dialogue

> **Dev:** "Should this JSON loader live in the **App-state API**?"
> **Domain expert:** "No — the API owns commands and selectors. The JSON loader is a **Serializer** that feeds it."
