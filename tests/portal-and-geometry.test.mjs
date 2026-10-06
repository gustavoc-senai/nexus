import test from 'node:test'
import assert from 'node:assert/strict'
import { canAccessPortal, portalForRole } from '../src/lib/portalAccess.ts'
import { missions } from '../src/services/missions.ts'
import { answerLabel, parseNumericAnswer, isNumericAnswerCorrect } from '../src/lib/geometryAnswers.ts'

const cases = [
  ['student', ['student'], true], ['student', ['teacher', 'admin'], false],
  ['teacher', ['student'], false], ['teacher', ['teacher', 'admin'], true],
  ['admin', ['student'], false], ['admin', ['teacher', 'admin'], true],
]
for (const [role, allowed, expected] of cases) {
  test(`${role} ${expected ? 'can' : 'cannot'} enter ${allowed.join('/')} portal`, () => assert.equal(canAccessPortal(role, allowed), expected))
}
test('each role redirects to its own portal', () => {
  assert.equal(portalForRole('student'), '/student')
  assert.equal(portalForRole('teacher'), '/teacher')
  assert.equal(portalForRole('admin'), '/teacher')
})

const expected = {
  energia: ['6 faces, 12 arestas e 8 vértices', `${4 ** 3} m³`, `${6 * 3 * 2} m³`, `${6 * 3 ** 2} m²`, 4, 2 * (4 * 3 + 4 * 2 + 3 * 2)],
  hangar: [6 ** 3, 4 * 5 * 6, 2 * 1.5 * 1 * 1000, 3 * 2 ** 2 * 5, 4 * 3 / 2 * 5, 4 * 3 * 3 ** 3 / 3],
  oficina: [6 * 4 ** 2, 2 * (2 * 3 + 2 * 5 + 3 * 5), 2 * 3 * 2 * 4, 4 * 3 * 2 ** 2, 3 * 2 * 5, 5 * 3 ** 2],
  navegacao: [`${12 * 5} m³`, `${6 ** 2 * 4 / 3} m³`, String(5 + 5 - 2), `${6 ** 2 + 4 * 6 * 5 / 2} m²`, 96 / 12, 3 * 80 / 48],
  comunicacao: [`${3 ** 2 * 8}π m³`, `${2 * 2 ** 2 + 2 * 2 * 5}π m²`, `${3 ** 2 * 4 / 3}π m³`, `${3 * 5}π m²`, 450 / (3 * 5 ** 2), Math.hypot(9, 12)],
  suporte: [`${4 * 3 ** 3 / 3}π m³`, `${4 * 5 ** 2}π m²`, `${2 * 3 ** 3 / 3}π m³`, `${4 * (6 / 2) ** 2}π m²`, Math.sqrt(64 / 4), 3 * 3 * 2 ** 2],
  observatorio: [Math.hypot(3, 4, 12), 6 * 6 ** 2, 3 * (13 ** 2 - 12 ** 2) * 12 / 3, 10 ** 2 * Math.sqrt(13 ** 2 - 5 ** 2) / 3, 2 * Math.cbrt(256 / 4), 3 * 6 * (Math.hypot(6, 8) + 6)],
  laboratorio: [3 * 3 ** 2 * 4 + 2 * 3 * 3 ** 3 / 3, 6 ** 3 - 3 * 1 ** 2 * 6, 3 * 2 ** 2 * 6 + 3 * 2 ** 2 * 3 / 3, 2 * 6 * 2 ** 2 - 2 * 2 ** 2, 4 * (3 ** 3 - 2 ** 3), 8 * 5 * 4 - 2 ** 3],
  doca: [8 * 3 ** 3, 24 * 5 ** 2, 2 * 3 * 2 * (96 / (3 * 2 ** 2)), (4 + 2 * 0.5) ** 3 - 4 ** 3, (36000 / 1000) / (3 * (4 / 2) ** 2), 4 * Math.sqrt(3 * 144 / 12)],
}

test('expanded curriculum has 9 sectors, 54 challenges and 3 sectors per level', () => {
  assert.equal(missions.length, 9)
  assert.equal(missions.reduce((sum, m) => sum + m.questions.length, 0), 54)
  assert.equal(new Set(missions.map(m => m.id)).size, 9)
  for (const level of ['easy', 'intermediate', 'hard']) assert.equal(missions.filter(m => m.difficulty === level).length, 3)
  assert.deepEqual(missions.map(m => m.difficulty), ['easy', 'easy', 'easy', 'intermediate', 'intermediate', 'intermediate', 'hard', 'hard', 'hard'])
})
for (const mission of missions) {
  test(`${mission.title}: correct calculations and complete visual support`, () => {
    assert.equal(mission.questions.length, 6)
    for (const [i, question] of mission.questions.entries()) {
      if (question.numericAnswer !== undefined) {
        assert.equal(question.numericAnswer, expected[mission.id][i])
        assert.ok(isNumericAnswerCorrect(String(question.numericAnswer), expected[mission.id][i]))
        assert.ok(question.unit)
      } else {
        assert.equal(question.options[question.answer], expected[mission.id][i])
        assert.equal(new Set(question.options).size, 4)
      }
      assert.ok(answerLabel(question))
      assert.ok(question.solid.label)
      assert.ok(question.explanation)
    }
    assert.ok(mission.objectives.length)
    assert.ok(mission.formulas.length)
  })
}
test('numeric answers support decimal comma and period without confusing blank or invalid input with zero', () => {
  assert.equal(parseNumericAnswer('1,5'), 1.5)
  assert.equal(parseNumericAnswer(' 1.5 '), 1.5)
  assert.equal(parseNumericAnswer('0'), 0)
  for (const value of ['', ' ', 'NaN', 'Infinity', '36 m²', '1.234,56', '1,2,3']) assert.equal(parseNumericAnswer(value), null)
  assert.ok(isNumericAnswerCorrect('1,5', 1.5))
  assert.ok(!isNumericAnswerCorrect('', 0))
  assert.ok(!isNumericAnswerCorrect('37', 36))
})
