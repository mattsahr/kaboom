import {
    HOME_DIRECTORY,
    HOME_PAGE_CATEGORY,
    ORPHAN_CATEGORY,
    ORPHAN_CATEGORY_LABEL
} from './nav-constants';

export const sortMethods = (() => {
    const fullT= item => (item.title || '' ) + 
        (item.subtitle_A ? ' ' + item.subtitle_A : '') + 
        (item.subtitle_B ? ' ' + item.subtitle_B : '');

    const sortByURL = (A, B) => A.url < B.url ? -1 : A.url > B.url ? 1 : 0;
    const sortByTitle = (A, B) => fullT(A) < fullT(B) ? -1 : fullT(A) > fullT(B) ? 1 : 0;

    const sortByDate = (A, B) => A.date < B.date ? -1 : A.date > B.date ? 1 : 0;

    return {
        title: sortByTitle,
        date: sortByDate,
        url: sortByURL
    };
})();

export const getList = (albums, direction, activeSort, current) => {
    if (direction === 'descending') {
        return [...albums].sort(activeSort).reverse()
            .filter(next => next.url !== current && next.url !== HOME_DIRECTORY);
    }
    return [...albums].sort(activeSort)
        .filter(next => next.url !== current && next.url !== HOME_DIRECTORY);
};

export const composeNavGroups = (list, categories) => categories
    .filter(cat => cat !== HOME_PAGE_CATEGORY)
    .map(cat => cat === ORPHAN_CATEGORY
        ? ({
            category: ORPHAN_CATEGORY_LABEL,
            items: list.filter(next => !next.navCategories || !next.navCategories.length)
          })
        : ({
            category: cat,
            items: list.filter(next => next.navCategories && next.navCategories.includes(cat))
          })
    )
    .filter(group => (group.items && group.items.length));
