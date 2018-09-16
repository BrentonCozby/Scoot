import FormService from './formService.js'

describe('FormService', () => {
  describe('resetFieldMessages', () => {
    it('sets all message properties to null for each field', () => {
      let fields = {
        foo: {message: {type: 'error', text: 'foo error'}},
        bar: {type: 'radio'}
      }

      expect(FormService.resetFieldMessages(fields)).toEqual({
        foo: {message: null},
        bar: {type: 'radio', message: null}
      })
    })
  })

  describe('setFieldMessages', () => {
    it('sets error message to corrersponding field and nullifies message properties for other fields', () => {
      let fields = {
        foo: {message: {type: 'error', text: 'foo error'}},
        bar: {type: 'radio'}
      }

      const messageMap = {
        bar: 'bar error'
      }

      expect(FormService.setFieldMessages(fields, messageMap, 'error')).toEqual({
        foo: {message: null},
        bar: {type: 'radio', message: {type: 'error', text: 'bar error'}}
      })
    })
  })
})
