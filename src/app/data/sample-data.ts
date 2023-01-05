export const expense_fields = {
  data: (() => {
    const dependentFields = [];
    for (let i = 0; i <= 25; i++) {
      dependentFields.push({
        id: i,
        name: 'Dependent field ' + i,
        is_mandatory: false,
      });
    }
    return dependentFields;
  })(),
};

export const getFieldValuesById = (id = 0) => ({
  data: [
    {
      label: `Open field ${id + 1}`,
      value: `Open field ${id + 1}`,
      dependent_field_ids: id < 24 ? [id + 1] : [],
    },
    {
      label: `Open field ${id + 2}`,
      value: `Open field ${id + 2}`,
      dependent_field_ids: id < 23 ? [id + 2] : [],
    },
    {
      label: `No further dependency`,
      value: `No further dependency`,
      dependent_field_ids: [],
    },
    {
      label: `Open field ${id + 4}`,
      value: `Open field ${id + 4}`,
      dependent_field_ids: id < 21 ? [id + 4] : [],
    },
    {
      label: `Open field ${id + 5}`,
      value: `Open field ${id + 5}`,
      dependent_field_ids: id < 20 ? [id + 5] : [],
    },
  ],
});

export const sampleData = {
  expense_fields,
  getFieldValuesById,
};
