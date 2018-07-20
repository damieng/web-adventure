namespace Common {
    const dim = 0xd7;

    export class Spectrum {
        public Palette: Array<Color> = [
            new Color(0, 0, 0),
            new Color(0, 0, dim),
            new Color(dim, 0, 0),
            new Color(dim, 0, dim),
            new Color(0, dim, 0),
            new Color(0, dim, dim),
            new Color(dim, dim, 0),
            new Color(dim, dim, dim)
        ];
    }
}