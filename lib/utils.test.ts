import { describe, it, expect } from 'vitest'
import { getInitials } from './utils'

describe('getInitials()', () => {
    it('should return initials for a standard two-word name', () => {
        const name = "Michael Jackson";
        const result = getInitials(name);
        expect(result).toBe("MJ");
    })

    it("should return three names correctly", () => {
        expect(getInitials("Peter Mano Obi")).toBe("PMO")
    })

    it("should return an empty string for an empty input", () => {
        expect(getInitials("")).toBe("")
    })
})