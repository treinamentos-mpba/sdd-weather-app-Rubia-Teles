import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  type LucideIcon,
  Sun,
} from 'lucide-react';

interface WeatherAppearance {
  label: string;
  Icon: LucideIcon;
}

const unavailable: WeatherAppearance = { label: 'Condição indisponível', Icon: Cloud };

export function isWeatherCode(value: unknown): value is number {
  return typeof value === 'number' && getWeatherAppearance(value) !== unavailable;
}

export function getWeatherAppearance(code: number | null): WeatherAppearance {
  if (code === 0) return { label: 'Céu limpo', Icon: Sun };
  if (code === 1) return { label: 'Predominantemente limpo', Icon: CloudSun };
  if (code === 2) return { label: 'Parcialmente nublado', Icon: CloudSun };
  if (code === 3) return { label: 'Encoberto', Icon: Cloud };
  if (code !== null && [45, 48].includes(code)) return { label: 'Nevoeiro', Icon: CloudFog };
  if (code !== null && [51, 53, 55].includes(code)) return { label: 'Garoa', Icon: CloudDrizzle };
  if (code !== null && [56, 57].includes(code))
    return { label: 'Garoa congelante', Icon: CloudDrizzle };
  if (code !== null && [61, 63, 65].includes(code)) return { label: 'Chuva', Icon: CloudRain };
  if (code !== null && [66, 67].includes(code))
    return { label: 'Chuva congelante', Icon: CloudRain };
  if (code !== null && [71, 73, 75, 77].includes(code)) return { label: 'Neve', Icon: CloudSnow };
  if (code !== null && [80, 81, 82].includes(code))
    return { label: 'Pancadas de chuva', Icon: CloudRain };
  if (code !== null && [85, 86].includes(code))
    return { label: 'Pancadas de neve', Icon: CloudSnow };
  if (code === 95) return { label: 'Trovoadas', Icon: CloudLightning };
  if (code !== null && [96, 99].includes(code))
    return { label: 'Trovoadas com granizo', Icon: CloudLightning };
  return unavailable;
}
