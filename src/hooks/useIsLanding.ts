import { useLocation } from 'react-router-dom';
import { isStandalone } from '@/components/InstallGuide';

/**
 * « / » affiche la page vitrine dans un navigateur (visiteurs, Google) et la
 * carte dans l'app installée : on pousse à installer, comme les apps de VTC.
 */
export const useIsLanding = () => useLocation().pathname === '/' && !isStandalone();
