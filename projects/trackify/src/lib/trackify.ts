type Change<T> = {
  property: keyof T;
  previous: T[keyof T] | null;
  current: T[keyof T] | null;
  type: ChangeType;
};

export enum ChangeType {
  Added = 'added',
  Removed = 'removed',
  Modified = 'modified',
}

export class Trackify<T extends object> {
  private readonly original: T;
  private current: T;

  private ignoredProperties = new Set<string>();
  private includedProperties = new Set<string>();
  private customComparers = new Map<string, (a: any, b: any) => boolean>();

  constructor(original: T) {
    if (!original) throw new Error("Original object cannot be null.");
    this.original = JSON.parse(JSON.stringify(original)); // Deep clone
    this.current = original;
  }

  get changes(): Change<keyof T>[] {
    const changes: Change<any>[] = [];
    const properties = Object.keys(this.original) as Array<keyof T>;

    for (const property of properties) {
      if (this.ignoredProperties.has(String(property))) continue;
      if (this.includedProperties.size > 0 && !this.includedProperties.has(String(property))) continue;

      const originalValue = (this.original as any)[property];
      const currentValue = (this.current as any)[property];

      if (this.isCollection(originalValue)) {
        this.detectCollectionChanges(String(property), originalValue, currentValue, changes);
      }
      else if (!this.areEqual(String(property), originalValue, currentValue)) {
        changes.push(this.getChange(String(property), originalValue, currentValue, ChangeType.Modified));
      }
    }

    return changes;
  }

  addComparer(propertyName: string, comparer: (a: any, b: any) => boolean): this {
    this.customComparers.set(propertyName, comparer);
    return this;
  }

  include(propertySelector: keyof T): this {
    this.includedProperties.add(String(propertySelector));
    return this;
  }

  includes(propertySelectors: Array<keyof T>): this {
    for (const property of propertySelectors) {
      this.includedProperties.add(String(property));
    }
    return this;
  }

  ignore(propertySelector: keyof T): this {
    this.ignoredProperties.add(String(propertySelector));
    return this;
  }

  ignores(propertySelectors: Array<keyof T>): this {
    for (const property of propertySelectors) {
      this.ignoredProperties.add(String(property));
    }
    return this;
  }

  update(newState: T): void {
    if (!newState) throw new Error("New state cannot be null.");
    this.current = JSON.parse(JSON.stringify(newState));
  }

  private isCollection(value: any): boolean {
    return Array.isArray(value);
  }

  private detectCollectionChanges<T>(
    propertyName: keyof T,
    original: T[] | null,
    current: T[] | null,
    changes: Change<T>[]
  ): void {
    const originalSet = new Set(original || []);
    const currentSet = new Set(current || []);

    for (const item of currentSet) {
      if (!originalSet.has(item)) {
        changes.push(this.getChange(propertyName, null, item as T[keyof T], ChangeType.Added));
      }
    }

    for (const item of originalSet) {
      if (!currentSet.has(item)) {
        changes.push(this.getChange(propertyName, item as T[keyof T], null, ChangeType.Removed));
      }
    }
  }

  private areEqual(propertyName: string, originalValue: any, currentValue: any): boolean {
    const comparer = this.customComparers.get(propertyName);
    if (comparer) {
      return comparer(originalValue, currentValue);
    }
    return originalValue === currentValue; // Default strict equality check
  }

  private getChange<T>(
    property: keyof T,
    previous: T[keyof T] | null,
    current: T[keyof T] | null,
    type: ChangeType
  ): Change<T> {
    let change: Change<T> = { property, previous, current, type };

    change.property = property;
    change.previous = previous;
    change.current = current;
    change.type = type;

    return change;
  }

}
