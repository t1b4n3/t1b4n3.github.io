document.addEventListener("DOMContentLoaded", () => {

    const grids = document.querySelectorAll(".post-grid");

    grids.forEach((grid) => {

        const cards = Array.from(
            grid.querySelectorAll(".post-card")
        );

        /*
         * Posts are already ordered by Jekyll:
         * newest → oldest.
         *
         * We keep that order and only randomize
         * the visual layout.
         */

        cards.forEach((card, index) => {

            const random = Math.random();

            /*
             * First post is always featured,
             * but its position is still determined
             * by the normal document order.
             */
            if (index === 0) {

                card.classList.add("featured");

            } else if (random < 0.20) {

                card.classList.add("wide");

            } else if (random < 0.40) {

                card.classList.add("small");

            }

        });

    });

});


async function loadGitHubStars() {

    const elements =
        document.querySelectorAll("[data-stars]");

    for (const element of elements) {

        const repository =
            element.dataset.stars;

        try {

            const response = await fetch(
                `https://api.github.com/repos/${repository}`
            );

            if (!response.ok) {
                throw new Error("GitHub API request failed");
            }

            const data = await response.json();

            element.textContent =
                data.stargazers_count;

        } catch (error) {

            element.textContent = "—";

        }

    }

}

document.addEventListener(
    "DOMContentLoaded",
    loadGitHubStars
);

document.addEventListener("DOMContentLoaded", () => {

    const grids = document.querySelectorAll(
        ".post-grid, .project-grid"
    );

    grids.forEach((grid) => {

        const cards = Array.from(
            grid.children
        );

        /*
         * Posts/projects remain in their original
         * chronological/manual order.
         *
         * We only change their visual grid placement.
         */

        const layouts = [

            // Layout 1
            [
                "large",
                "small",
                "small",
                "large"
            ],

            // Layout 2
            [
                "small",
                "large",
                "large",
                "small"
            ],

            // Layout 3
            [
                "large",
                "large",
                "small",
                "small"
            ],

            // Layout 4
            [
                "small",
                "small",
                "large",
                "large"
            ]

        ];


        const layout =
            layouts[
                Math.floor(
                    Math.random() * layouts.length
                )
            ];


        cards.forEach((card, index) => {

            card.classList.remove(
                "large",
                "small"
            );

            const size =
                layout[index % layout.length];

            card.classList.add(size);

        });

    });

});