from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiExample
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .services import CoinGeckoService
from .models import UserWatchlist
from .serializers import (
    MarketCoinSerializer, 
    CoinDetailSerializer, 
    ExchangeSerializer, 
    TrendingSerializer, 
    GlobalStatsSerializer,
    UserWatchlistSerializer,
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer
)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        # Pobieramy stworzonego usera i generujemy token
        user = User.objects.get(username=response.data["username"])
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data
        })


class UserWatchlistViewSet(viewsets.ModelViewSet):
    """
    Obsługuje ulubione kryptowaluty użytkowników (Watchlist).
    Tylko zalogowani użytkownicy!
    """
    serializer_class = UserWatchlistSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'coin_id'

    def get_queryset(self):
        return UserWatchlist.objects.filter(user=self.request.user).order_by('-added_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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
        days = request.query_params.get('days', 7)
        data = CoinGeckoService.get_coin_market_chart(coin_id, days=days)
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