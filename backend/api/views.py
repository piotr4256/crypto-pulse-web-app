from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets  
from drf_spectacular.utils import extend_schema, OpenApiExample
from .services import CoinGeckoService
from .models import CryptoCurrency
from .serializers import (
    MarketCoinSerializer, 
    CoinDetailSerializer, 
    ExchangeSerializer, 
    TrendingSerializer, 
    GlobalStatsSerializer,
    CryptoCurrencyModelSerializer
)
class CryptoCurrencyViewSet(viewsets.ModelViewSet):
    """
    Obsługuje dane z bazy danych Supabase (CRUD).
    Pod adresem /api/cryptocurrencies/ zobaczysz JSONa z bazy.
    """
    queryset = CryptoCurrency.objects.all()
    serializer_class = CryptoCurrencyModelSerializer
class MarketListView(APIView):
    """
    Pobiera listę top 100 kryptowalut.
    """
    @extend_schema(responses=MarketCoinSerializer(many=True))
    def get(self, request):
        data = CoinGeckoService.get_markets()
        if isinstance(data, dict) and 'error' in data:
            return Response(data, status=data.get('status', 500))
            
        serializer = MarketCoinSerializer(data, many=True)
        return Response(serializer.data)

class CoinDetailView(APIView):
    """
    Pobiera szczegółowe dane konkretnej monety.
    """
    @extend_schema(responses=CoinDetailSerializer)
    def get(self, request, coin_id):
        data = CoinGeckoService.get_coin_details(coin_id)   
        if isinstance(data, dict) and 'error' in data:
            return Response(data, status=data.get('status', 500))
            
        serializer = CoinDetailSerializer(data)
        return Response(serializer.data)

class CoinMarketChartView(APIView):
    """
    Pobiera historyczny wykres dla monety (np. z 7 dni).
    Zwracamy surowe dane (prices, market_caps, total_volumes) z uwagi na format wykresów.
    """
    @extend_schema(responses={200: dict})
    def get(self, request, coin_id):
        data = CoinGeckoService.get_coin_market_chart(coin_id, days=7)
        if isinstance(data, dict) and 'error' in data:
            return Response(data, status=data.get('status', 500))
            
        return Response(data)

class ExchangesListView(APIView):
    """
    Pobiera listę 100 najpopularniejszych giełd.
    """
    @extend_schema(responses=ExchangeSerializer(many=True))
    def get(self, request):
        data = CoinGeckoService.get_exchanges()
        if isinstance(data, dict) and 'error' in data:
            return Response(data, status=data.get('status', 500))
            
        serializer = ExchangeSerializer(data, many=True)
        return Response(serializer.data)

class TrendingListView(APIView):
    """
    Pobiera listę najczęściej wyszukiwanych monet (trending).
    """
    @extend_schema(responses=TrendingSerializer)
    def get(self, request):
        data = CoinGeckoService.get_trending()   
        if isinstance(data, dict) and 'error' in data:
            return Response(data, status=data.get('status', 500))
            
        serializer = TrendingSerializer(data)
        return Response(serializer.data)

class GlobalStatsView(APIView):
    """
    Pobiera globalne statystyki kryptowalut.
    """
    @extend_schema(responses=GlobalStatsSerializer)
    def get(self, request):
        data = CoinGeckoService.get_global()   
        if isinstance(data, dict) and 'error' in data:
            return Response(data, status=data.get('status', 500))
            
        # Global API zwraca dane wewnątrz klucza 'data'
        global_data = data.get('data', {})
        serializer = GlobalStatsSerializer(global_data)
        return Response(serializer.data)