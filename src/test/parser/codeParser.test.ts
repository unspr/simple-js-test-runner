import * as assert from 'assert';
import { expect } from 'chai';
import _ from 'lodash';
import { Parser } from '../../parser/parser';

describe('codeParser Tests', () => {
  it('Valid Token', async () => {
    const code = `
            describe('Fake test', () => {});
        `;

    const parser = new Parser();
    await parser.parseAST(code);
    const locations = await parser.parseTestLine();
    assert.equal(1, locations.length);
  });

  it('Invalid Tokens', async () => {
    const code = `
            var test = 'Fluo';
            let src = {test: true, type: 'BANK'};
            if (!src.test && src.type === 'BANK') {
                let firstName = 'test';
            }
        `;
    const parser = new Parser();
    await parser.parseAST(code);
    const locations = await parser.parseTestLine();
    assert.equal(0, locations.length);
  });

  it('Jsx syntax', async () => {
    const code = `
        describe("JsonFormTextField", () => {
            test("Test render" + "2", () => {
                const config: ITextFieldConfig = {
                    fieldType: "text",
                    name: "Owner",
                };
                const wrapper = mount(<FormWrapper>
                    <JsonFormTextField
                        config={config}
                        value={null} />
                </FormWrapper>);
                const ownerInput = wrapper.find("input[type='text'][id='Owner']");
                expect(ownerInput.length).toBe(1);
                ownerInput.simulate("change");
            });
        });

        describe("Json$FormTextField2", () => {
            test("| Test render'2", () => {
                return;
            });
        });
        `;

    const parser = new Parser();
    await parser.parseAST(code);
    const line2TestName = await parser.parseTestLine2TestName();

    expect(line2TestName[2]).to.equal('JsonFormTextField ');
    expect(line2TestName[3]).to.equal('JsonFormTextField Test render2$');
    expect(line2TestName[19]).to.equal('Json\\$FormTextField2 ');
    expect(line2TestName[20]).to.equal('Json\\$FormTextField2 \\| Test render\'2$');
    expect(_.size(line2TestName)).to.equal(4);
  });
});
