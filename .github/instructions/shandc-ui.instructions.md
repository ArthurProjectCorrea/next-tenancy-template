---
description: Guidelines for working with ShadCN UI components and documentation
applyTo: '\**/*' # always load when referencing UI or component work
---

This project uses the [shadcn/ui](https://ui.shadcn.com/) component library built on Radix UI and Tailwind CSS. The documentation under `docs/shandc-ui` contains usage examples, thematic guidance, and an index of all available components.

Follow these rules when interacting with or generating UI components:

1. **Use Radix/ShadCN patterns** – consult the `.mdx` files under `docs/shandc-ui/components` for implementation details, props, and layout examples. Create new components by following the same structure and styling conventions.
2. **Never modify library components directly** – the `ui` directory (and any generated components from shadcn) is treated as a vendor library. Do not change existing component code; if customization is required, extend or wrap the component in a separate file.
3. **Style consistency** – apply Tailwind utility classes and maintain dark/light mode handling as shown in the docs. Keep accessibility concerns (ARIA attributes, keyboard navigation) consistent with Radix guidelines.
4. **Documentation updates** – whenever you add or change a component wrapper, update or add a corresponding MDX file in `docs/shandc-ui/components` and regenerate the documentation site if needed.
5. **Versioning and import paths** – always import components from `@/ui` or the path configured by shadcn generator; do not create duplicate implementations.
6. **Testing and linting** – ensure new components pass existing lint rules and include basic tests if applicable.

> ⚠️ **Important:** Under no circumstances should you alter the source files of components in the `ui` directory. Treat them as immutable dependencies; custom UI logic belongs in separate modules or custom wrappers.

These guidelines should be followed by the AI when generating code, suggestions, or reviewing pull requests related to UI components.
