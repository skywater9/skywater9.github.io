export type CollectionKey =
  | 'research'
  | 'frc-robotics'
  | 'cad-design'
  | 'rocket-design'
  | 'stem-outreach';

export const COLLECTION_ORDER: CollectionKey[] = [
  'research',
  'frc-robotics',
  'cad-design',
  'rocket-design',
  'stem-outreach',
];

export const COLLECTION_META: Record<
  CollectionKey,
  { label: string; blurb: string }
> = {
  research: {
    label: 'Research',
    blurb: 'Independent research on topology optimization for anisotropic 3D printed structures.',
  },
  'frc-robotics': {
    label: 'FRC Robotics',
    blurb: 'Competition robot subsystems, CAD leadership, and training resources for FRC Team 1148.',
  },
  'cad-design': {
    label: 'CAD Design',
    blurb: 'Independent CAD work outside of competition robotics.',
  },
  'rocket-design': {
    label: 'Rocket Design',
    blurb: 'Aerodynamic modeling, simulation, and flight testing with the Rocketry Club and UCLA program.',
  },
  'stem-outreach': {
    label: 'STEM Outreach',
    blurb: 'Remote CAD and engineering mentorship for the Hatay Science High School robotics program.',
  },
};
