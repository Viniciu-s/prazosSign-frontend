import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchingFieldsValidator(sourceKey: string, targetKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const sourceControl = control.get(sourceKey);
    const targetControl = control.get(targetKey);

    if (!sourceControl || !targetControl) {
      return null;
    }

    const currentErrors = targetControl.errors ?? {};

    if (sourceControl.value !== targetControl.value) {
      targetControl.setErrors({
        ...currentErrors,
        mismatch: true
      });

      return { mismatch: true };
    }

    if (!currentErrors['mismatch']) {
      return null;
    }

    const { mismatch, ...remainingErrors } = currentErrors;
    void mismatch;
    targetControl.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);

    return null;
  };
}
