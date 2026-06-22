# App-state API and serializers

We are organizing the builder around a central **app state** boundary with a command/selector API, and moving format-specific transformations into dedicated **serializers** for JSON, shortcode, and HTML. This keeps the core state model immutable at the boundary, makes format handling symmetric, and avoids scattering persistence/export logic across UI components and hooks.
