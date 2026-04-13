from .models import UserWatchlist
from rest_framework import serializers

class UserWatchlistSerializer(serializers.ModelSerializer):
    """ Serializuje listę obserwowanych (tylko ID monety) """
    username = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = UserWatchlist
        fields = ['id', 'user', 'username', 'coin_id', 'added_at']
        read_only_fields = ['user', 'added_at']

from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class MarketCoinSerializer(serializers.Serializer):
    """ Serializuje dane z endpointu /coins/markets """
    id = serializers.CharField()
    symbol = serializers.CharField()
    name = serializers.CharField()
    image = serializers.URLField(allow_blank=True, required=False)
    current_price = serializers.FloatField(allow_null=True)
    market_cap = serializers.FloatField(allow_null=True)
    market_cap_rank = serializers.IntegerField(allow_null=True)
    total_volume = serializers.FloatField(allow_null=True)
    high_24h = serializers.FloatField(allow_null=True)
    low_24h = serializers.FloatField(allow_null=True)
    price_change_percentage_24h = serializers.FloatField(allow_null=True)
    circulating_supply = serializers.FloatField(allow_null=True)
    total_supply = serializers.FloatField(allow_null=True)
    max_supply = serializers.FloatField(allow_null=True)
    ath = serializers.FloatField(allow_null=True, required=False)
    ath_change_percentage = serializers.FloatField(allow_null=True, required=False)
    ath_date = serializers.CharField(allow_null=True, required=False)
    atl = serializers.FloatField(allow_null=True, required=False)
    atl_change_percentage = serializers.FloatField(allow_null=True, required=False)
    atl_date = serializers.CharField(allow_null=True, required=False)

class CoinDetailSerializer(serializers.Serializer):
    """ Serializuje dane z endpointu /coins/{id} obcinając zbędne informacje """
    id = serializers.CharField()
    symbol = serializers.CharField()
    name = serializers.CharField()
    
    # Wyciągamy tylko angielski opis (bez długich słowników w różnych językach)
    description = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    market_data = serializers.SerializerMethodField()

    def get_description(self, obj):
        desc = obj.get('description', {})
        return desc.get('en', '')

    def get_image(self, obj):
        img_data = obj.get('image', {})
        # Zwracamy tylko duży obrazek (lub wszystkie 3 rozmiary)
        return {
            'thumb': img_data.get('thumb'),
            'small': img_data.get('small'),
            'large': img_data.get('large'),
        }

    def get_market_data(self, obj):
        md = obj.get('market_data', {})
        return {
            'current_price_usd': md.get('current_price', {}).get('usd'),
            'market_cap_usd': md.get('market_cap', {}).get('usd'),
            'total_volume_usd': md.get('total_volume', {}).get('usd'),
            'high_24h_usd': md.get('high_24h', {}).get('usd'),
            'low_24h_usd': md.get('low_24h', {}).get('usd'),
            'price_change_percentage_24h': md.get('price_change_percentage_24h'),
        }

class ExchangeSerializer(serializers.Serializer):
    """ Serializuje giełdy """
    id = serializers.CharField()
    name = serializers.CharField()
    year_established = serializers.IntegerField(allow_null=True)
    country = serializers.CharField(allow_null=True, allow_blank=True)
    description = serializers.CharField(allow_null=True, allow_blank=True)
    url = serializers.URLField(allow_blank=True)
    image = serializers.URLField(allow_blank=True)
    trust_score = serializers.IntegerField(allow_null=True)
    trust_score_rank = serializers.IntegerField(allow_null=True)
    trade_volume_24h_btc = serializers.FloatField(allow_null=True)

class TrendingItemSerializer(serializers.Serializer):
    """ Serializuje pojedynczy rekord monety z /search/trending """
    id = serializers.CharField()
    coin_id = serializers.IntegerField(allow_null=True)
    name = serializers.CharField()
    symbol = serializers.CharField()
    market_cap_rank = serializers.IntegerField(allow_null=True)
    thumb = serializers.URLField(allow_blank=True)
    price_btc = serializers.FloatField(allow_null=True)
    score = serializers.IntegerField(allow_null=True)
    data = serializers.DictField(required=False)

class TrendingSerializer(serializers.Serializer):
    """ Główny serializator pod trendy """
    coins = serializers.SerializerMethodField()

    def get_coins(self, obj):
        # API zwraca {"coins": [{"item": {...}}, {"item": {...}}]}
        raw_coins = obj.get('coins', [])
        cleaned_coins = [c.get('item', {}) for c in raw_coins]
        return TrendingItemSerializer(cleaned_coins, many=True).data

class GlobalStatsSerializer(serializers.Serializer):
    """ Serializuje statystyki globalne """
    active_cryptocurrencies = serializers.IntegerField(required=False)
    markets = serializers.IntegerField(required=False)
    total_market_cap = serializers.SerializerMethodField()
    total_volume = serializers.SerializerMethodField()
    market_cap_percentage = serializers.DictField(child=serializers.FloatField(), required=False)
    market_cap_change_percentage_24h_usd = serializers.FloatField(required=False)

    def get_total_market_cap(self, obj):
        tmc = obj.get('total_market_cap')
        if isinstance(tmc, dict):
            return {"usd": tmc.get('usd')}
        return {"usd": None}

    def get_total_volume(self, obj):
        vol = obj.get('total_volume')
        if isinstance(vol, dict):
            return {"usd": vol.get('usd')}
        return {"usd": None}
