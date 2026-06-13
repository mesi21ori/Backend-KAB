export type FavoriteType = 'design-project' | 'construction-project' | 'site-report' | 'letter';

export interface FavoriteItem {
  type: FavoriteType;
  id: string; // project code, report ID, etc.
  name: string; // project name or report title
  url: string; // route to detail page
  addedAt: string; // ISO timestamp
}

