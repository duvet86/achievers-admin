export function mockTime() {
  // eslint-disable-next-line no-global-assign
  Date = class extends Date {
    constructor(...options) {
      if (options.length) {
        super(...options);
      } else {
        super(2024, 10, 24, 0, 0);
      }
    }
  };
}
