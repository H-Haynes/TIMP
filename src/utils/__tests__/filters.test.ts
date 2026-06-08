import { describe, it, expect } from "vitest"
import { durationFormat, countFormat, durationTransSec, secToMin } from "../filters"

describe("durationFormat", () => {
  it("returns --:-- for falsy values", () => {
    expect(durationFormat(0)).toBe("--:--")
  })

  it("formats milliseconds to mm:ss", () => {
    expect(durationFormat(125000)).toBe("02:05")
  })

  it("pads single-digit seconds", () => {
    expect(durationFormat(60000)).toBe("01:00")
  })
})

describe("secToMin", () => {
  it("converts seconds to mm:ss", () => {
    expect(secToMin(125)).toBe("02:05")
  })

  it("handles zero", () => {
    expect(secToMin(0)).toBe("00:00")
  })
})

describe("countFormat", () => {
  it("returns 0 for NaN", () => {
    expect(countFormat(Number.NaN)).toBe(0)
  })

  it("returns value unchanged below 10000", () => {
    expect(countFormat(9999)).toBe(9999)
  })

  it("formats 万 for values >= 10000", () => {
    expect(countFormat(12345)).toBe("1万")
  })

  it("formats 亿 for values >= 100000000", () => {
    expect(countFormat(200000000)).toBe("2亿")
  })
})

describe("durationTransSec", () => {
  it("returns 0 for falsy input", () => {
    expect(durationTransSec("")).toBe(0)
  })

  it("converts mm:ss to total seconds", () => {
    expect(durationTransSec("02:05")).toBe(125)
  })
})
