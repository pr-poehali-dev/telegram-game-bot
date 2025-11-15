import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  cost: number;
  effect: number;
  type: 'click' | 'auto' | 'multiplier';
}

interface Player {
  id: number;
  name: string;
  coins: number;
  level: number;
}

const Index = () => {
  const [coins, setCoins] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [autoClickRate, setAutoClickRate] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { toast } = useToast();

  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    {
      id: 'click1',
      name: 'Острый меч',
      description: '+1 монет за клик',
      icon: 'Sword',
      level: 0,
      cost: 10,
      effect: 1,
      type: 'click'
    },
    {
      id: 'click2',
      name: 'Магический посох',
      description: '+5 монет за клик',
      icon: 'Wand2',
      level: 0,
      cost: 100,
      effect: 5,
      type: 'click'
    },
    {
      id: 'auto1',
      name: 'Помощник',
      description: '+1 монета в секунду',
      icon: 'User',
      level: 0,
      cost: 50,
      effect: 1,
      type: 'auto'
    },
    {
      id: 'auto2',
      name: 'Робот',
      description: '+5 монет в секунду',
      icon: 'Bot',
      level: 0,
      cost: 300,
      effect: 5,
      type: 'auto'
    },
    {
      id: 'mult1',
      name: 'Двойная сила',
      description: 'x2 к доходу',
      icon: 'Zap',
      level: 0,
      cost: 500,
      effect: 2,
      type: 'multiplier'
    },
    {
      id: 'mult2',
      name: 'Тройная мощь',
      description: 'x3 к доходу',
      icon: 'Sparkles',
      level: 0,
      cost: 2000,
      effect: 3,
      type: 'multiplier'
    }
  ]);

  const [leaderboard] = useState<Player[]>([
    { id: 1, name: 'Игрок1', coins: 15000, level: 12 },
    { id: 2, name: 'Игрок2', coins: 12000, level: 10 },
    { id: 3, name: 'Игрок3', coins: 8500, level: 8 },
    { id: 4, name: 'Игрок4', coins: 6000, level: 7 },
    { id: 5, name: 'Ты', coins: coins, level: level }
  ].sort((a, b) => b.coins - a.coins));

  useEffect(() => {
    if (autoClickRate > 0) {
      const interval = setInterval(() => {
        const income = autoClickRate * multiplier;
        setCoins(prev => prev + income);
        setExp(prev => prev + income);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoClickRate, multiplier]);

  useEffect(() => {
    const expNeeded = level * 100;
    if (exp >= expNeeded) {
      setLevel(prev => prev + 1);
      setExp(0);
      toast({
        title: '🎉 Новый уровень!',
        description: `Ты достиг ${level + 1} уровня!`,
      });
    }
  }, [exp, level, toast]);

  const handleClick = () => {
    const earned = clickPower * multiplier;
    setCoins(prev => prev + earned);
    setExp(prev => prev + earned);
    
    const button = document.getElementById('hero-button');
    if (button) {
      button.classList.remove('animate-bounce-click');
      void button.offsetWidth;
      button.classList.add('animate-bounce-click');
    }

    createCoinAnimation();
  };

  const createCoinAnimation = () => {
    const container = document.getElementById('coin-container');
    if (!container) return;

    const coin = document.createElement('div');
    coin.className = 'absolute text-2xl animate-coin-pop pointer-events-none';
    coin.textContent = `+${clickPower * multiplier}`;
    coin.style.left = `${Math.random() * 80 + 10}%`;
    coin.style.top = '50%';
    coin.style.color = '#F97316';
    coin.style.fontWeight = 'bold';
    
    container.appendChild(coin);
    setTimeout(() => coin.remove(), 1000);
  };

  const buyUpgrade = (upgrade: Upgrade) => {
    if (coins >= upgrade.cost) {
      setCoins(prev => prev - upgrade.cost);
      
      setUpgrades(prev => prev.map(u => {
        if (u.id === upgrade.id) {
          return {
            ...u,
            level: u.level + 1,
            cost: Math.floor(u.cost * 1.5)
          };
        }
        return u;
      }));

      if (upgrade.type === 'click') {
        setClickPower(prev => prev + upgrade.effect);
      } else if (upgrade.type === 'auto') {
        setAutoClickRate(prev => prev + upgrade.effect);
      } else if (upgrade.type === 'multiplier') {
        setMultiplier(prev => prev * upgrade.effect);
      }

      toast({
        title: '✅ Улучшение куплено!',
        description: upgrade.name,
      });
    } else {
      toast({
        title: '❌ Недостаточно монет',
        description: `Нужно еще ${upgrade.cost - coins} монет`,
        variant: 'destructive'
      });
    }
  };

  const expProgress = (exp / (level * 100)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Icon name="Crown" className="text-yellow-300" size={28} />
                  Уровень {level}
                </h1>
                <Progress value={expProgress} className="h-2 mt-2 bg-purple-900/50" />
                <p className="text-purple-100 text-sm mt-1">{exp} / {level * 100} опыта</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-white hover:bg-white/20"
              >
                <Icon name={soundEnabled ? "Volume2" : "VolumeX"} size={24} />
              </Button>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon name="Coins" className="text-yellow-300" size={32} />
                <h2 className="text-5xl font-bold text-white">
                  {coins.toLocaleString()}
                </h2>
              </div>
              <div className="flex items-center justify-center gap-4 text-purple-100 text-sm">
                <span className="flex items-center gap-1">
                  <Icon name="MousePointer2" size={16} />
                  {clickPower * multiplier}/клик
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Timer" size={16} />
                  {autoClickRate * multiplier}/сек
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="relative" id="coin-container">
          <Button
            id="hero-button"
            onClick={handleClick}
            className="w-full h-64 text-9xl bg-gradient-to-br from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 border-0 shadow-2xl rounded-3xl animate-pulse-glow"
          >
            ⚔️
          </Button>
        </div>

        <Tabs defaultValue="upgrades" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-purple-900/50">
            <TabsTrigger value="upgrades" className="data-[state=active]:bg-purple-600">
              <Icon name="ShoppingCart" size={18} className="mr-2" />
              Улучшения
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-purple-600">
              <Icon name="Trophy" size={18} className="mr-2" />
              Рейтинг
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
              <Icon name="Settings" size={18} className="mr-2" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upgrades" className="space-y-3 mt-4">
            {upgrades.map((upgrade) => (
              <Card key={upgrade.id} className="bg-card/50 backdrop-blur border-purple-500/30 hover:border-purple-500 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Icon name={upgrade.icon as any} size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{upgrade.name}</h3>
                        <p className="text-sm text-muted-foreground">{upgrade.description}</p>
                        {upgrade.level > 0 && (
                          <Badge variant="secondary" className="mt-1">
                            Уровень {upgrade.level}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => buyUpgrade(upgrade)}
                      disabled={coins < upgrade.cost}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Icon name="Coins" size={16} className="mr-1" />
                      {upgrade.cost.toLocaleString()}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-2 mt-4">
            {leaderboard.map((player, index) => (
              <Card key={player.id} className={`bg-card/50 backdrop-blur border-purple-500/30 ${player.name === 'Ты' ? 'border-yellow-500 border-2' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-purple-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{player.name}</p>
                        <p className="text-sm text-muted-foreground">Уровень {player.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-foreground flex items-center gap-1">
                        <Icon name="Coins" size={18} className="text-yellow-500" />
                        {player.coins.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="settings" className="space-y-3 mt-4">
            <Card className="bg-card/50 backdrop-blur border-purple-500/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Звуки</h3>
                    <p className="text-sm text-muted-foreground">Звуковые эффекты игры</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={soundEnabled ? 'bg-green-600 text-white border-green-600' : ''}
                  >
                    {soundEnabled ? 'Вкл' : 'Выкл'}
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-purple-500/30">
                  <div>
                    <h3 className="font-semibold text-foreground">Профиль</h3>
                    <p className="text-sm text-muted-foreground">ID: TG_USER_123</p>
                  </div>
                  <Icon name="User" size={32} className="text-purple-400" />
                </div>

                <div className="pt-4 border-t border-purple-500/30">
                  <h3 className="font-semibold text-foreground mb-2">Статистика</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Всего заработано:</span>
                      <span className="font-semibold text-foreground">{coins.toLocaleString()} монет</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Уровень:</span>
                      <span className="font-semibold text-foreground">{level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Улучшений куплено:</span>
                      <span className="font-semibold text-foreground">{upgrades.reduce((sum, u) => sum + u.level, 0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
