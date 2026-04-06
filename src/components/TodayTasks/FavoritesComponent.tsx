import React from 'react';
import styles from './TodayTasks.module.css';
import { useFavorites, useAppDispatch } from '../../app/hooks';
import { toggleFavorite } from '../../features/progress/progressSlice';

interface FavoritesComponentProps {
  onActivityClick: (activityId: string) => void;
}

const FavoritesComponent: React.FC<FavoritesComponentProps> = ({ onActivityClick }) => {
  const dispatch = useAppDispatch();
  const favorites = useFavorites();

  if (favorites.length === 0) {
    return null;
  }

  const handleToggleFavorite = (activityId: string) => {
    dispatch(toggleFavorite(activityId));
  };

  const handleActivityClick = (activityId: string) => {
    onActivityClick(activityId);
  };

  return (
    <div className={styles.favoritesSection}>
      <h3 className={styles.favoritesTitle}>
        ⭐ Избранное ({favorites.length})
      </h3>
      <div className={styles.favoritesList}>
        {favorites.map((activityId) => (
          <div key={activityId} className={styles.favoriteItem}>
            <button
              className={styles.favoriteButton}
              onClick={() => handleActivityClick(activityId)}
            >
              {activityId}
            </button>
            <button
              className={styles.removeFavoriteButton}
              onClick={() => handleToggleFavorite(activityId)}
              title="Удалить из избранного"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesComponent;
