describe('JsonFormTextField', () => {
  test('Test render' + '2', () => {
    const config: ITextFieldConfig = {
      fieldType: 'text',
      name: 'Owner',
    };
    const wrapper = mount(
      <FormWrapper>
        <JsonFormTextField config={config} value={null} />
      </FormWrapper>
    );
    const ownerInput = wrapper.find("input[type='text'][id='Owner']");
    expect(ownerInput.length).toBe(1);
    ownerInput.simulate('change');
  });
});

describe('Json$FormTextField2', () => {
  test("| Test render'2", () => {
    return;
  });
});
