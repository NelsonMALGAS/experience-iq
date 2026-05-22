export interface UpdatePropertyInput {
  propertyId: string;
  name: string;
  location: string;
}

export interface PropertyFieldErrors {
  propertyId?: string[];
  name?: string[];
  location?: string[];
}

export interface ValidationResult {
  valid: boolean;
  fieldErrors?: PropertyFieldErrors;
  data?: Required<UpdatePropertyInput>;
}

export function validateUpdatePropertyInput(
  input: UpdatePropertyInput,
): ValidationResult {
  const fieldErrors: PropertyFieldErrors = {};

  const trimmedId = input.propertyId?.trim() ?? "";
  const trimmedName = input.name?.trim() ?? "";
  const trimmedLocation = input.location?.trim() ?? "";

  // propertyId
  if (!trimmedId) {
    fieldErrors.propertyId = ["Property ID is required."];
  }

  // name
  if (!trimmedName) {
    fieldErrors.name = ["Property name is required."];
  } else if (trimmedName.length < 2) {
    fieldErrors.name = ["Property name must be at least 2 characters."];
  } else if (trimmedName.length > 80) {
    fieldErrors.name = ["Property name must be 80 characters or fewer."];
  }

  // location
  if (!trimmedLocation) {
    fieldErrors.location = ["Location is required."];
  } else if (trimmedLocation.length < 2) {
    fieldErrors.location = ["Location must be at least 2 characters."];
  } else if (trimmedLocation.length > 120) {
    fieldErrors.location = ["Location must be 120 characters or fewer."];
  }

  const hasErrors = Object.keys(fieldErrors).length > 0;

  if (hasErrors) {
    return { valid: false, fieldErrors };
  }

  return {
    valid: true,
    data: {
      propertyId: trimmedId,
      name: trimmedName,
      location: trimmedLocation,
    },
  };
}
