export const expense_fields = {
  data: (() => {
    const dependentFields = [];
    for (let i = 0; i <= 25; i++) {
      dependentFields.push({
        id: i,
        name: 'Dependent field ' + i,
        is_mandatory: true,
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
      dependent_field_id: id < 24 ? id + 1 : null,
    },
    {
      label: `Open field ${id + 2}`,
      value: `Open field ${id + 2}`,
      dependent_field_id: id < 23 ? id + 2 : null,
    },
    {
      label: `No further dependency`,
      value: `No further dependency`,
      dependent_field_id: null,
    },
    {
      label: `Open field ${id + 4}`,
      value: `Open field ${id + 4}`,
      dependent_field_id: id < 21 ? id + 4 : null,
    },
    {
      label: `Open field ${id + 5}`,
      value: `Open field ${id + 5}`,
      dependent_field_id: id < 20 ? id + 5 : null,
    },
  ],
});

export const sampleData = {
  expense_fields,
  getFieldValuesById,
};
