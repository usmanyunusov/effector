//@flow

import {createStore} from '..'
import {createEvent} from 'effector/event'
import {argumentHistory} from 'effector/fixtures'

describe('reset before computation', () => {
  test('reset before computation', () => {
    const fn = jest.fn()
    const A = createEvent('A')
    const B = A.map(d => `${d}->B`)

    const target = createStore('init')
      .reset(B)
      .on(A, (state, d) => `${state} + ${d}`)

    target.watch(e => {
      fn(e)
    })

    A('[1]')
    A('[2]')

    expect(argumentHistory(fn)).toMatchInlineSnapshot(`
                                                                      Array [
                                                                        "init",
                                                                        "init + [1]",
                                                                        "init",
                                                                        "init + [2]",
                                                                        "init",
                                                                      ]
                                              `)
  })

  it("doesnt depend on methods' ordering", () => {
    const fn = jest.fn()
    const A = createEvent('A')
    const B = A.map(d => `${d}->B`)

    const target = createStore('init')
      .on(A, (state, d) => `${state} + ${d}`)
      .reset(B)

    target.watch(e => {
      fn(e)
    })

    A('[1]')
    A('[2]')

    expect(argumentHistory(fn)).toMatchInlineSnapshot(`
                                                                      Array [
                                                                        "init",
                                                                        "init + [1]",
                                                                        "init",
                                                                        "init + [2]",
                                                                        "init",
                                                                      ]
                                              `)
  })
})

describe('computation before reset', () => {
  test('computation before reset', () => {
    const fn = jest.fn()
    const A = createEvent('A')
    const B = A.map(d => `${d}->B`)

    const target = createStore('init')
      .reset(A)
      .on(B, (state, d) => `${state} + ${d}`)

    target.watch(e => {
      fn(e)
    })

    A('[1]')
    A('[2]')

    expect(argumentHistory(fn)).toMatchInlineSnapshot(`
                                                                  Array [
                                                                    "init",
                                                                    "init + [1]->B",
                                                                    "init",
                                                                    "init + [2]->B",
                                                                  ]
                                            `)
  })

  it("doesnt depend on methods' ordering", () => {
    const fn = jest.fn()
    const A = createEvent('A')
    const B = A.map(d => `${d}->B`)

    const target = createStore('init')
      .on(B, (state, d) => `${state} + ${d}`)
      .reset(A)

    target.watch(e => {
      fn(e)
    })

    A('[1]')
    A('[2]')

    expect(argumentHistory(fn)).toMatchInlineSnapshot(`
                                                                  Array [
                                                                    "init",
                                                                    "init + [1]->B",
                                                                    "init",
                                                                    "init + [2]->B",
                                                                  ]
                                            `)
  })
})

describe('dependencies of resettable stores', () => {
  test('dependencies of resettable stores', () => {
    const fnA = jest.fn()
    const fnB = jest.fn()
    const run = createEvent('run')
    const reset = run.map(d => `${d}->reset`)
    const A = createStore('A')
    const B = A.map(d => `B(${d})`)

    A.on(run, (state, d) => `${d}(${state})`).reset(reset)
    B.on(run, (state, d) => `${d}(${state})`).reset(reset)

    A.watch(e => {
      fnA(e)
    })
    B.watch(e => {
      fnB(e)
    })
    run('run')
    run('run')

    expect(argumentHistory(fnA)).toMatchInlineSnapshot(`
      Array [
        "A",
        "run(A)",
        "A",
        "run(A)",
        "A",
      ]
    `)

    expect(argumentHistory(fnB)).toMatchInlineSnapshot(`
      Array [
        "B(A)",
        "run(B(A))",
        "B(A)",
        "B(run(A))",
        "B(A)",
        "run(B(A))",
        "B(A)",
        "B(run(A))",
        "B(A)",
      ]
    `)
  })
})
