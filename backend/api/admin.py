from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import UserWatchlist

@admin.register(UserWatchlist)
class UserWatchlistAdmin(ModelAdmin):
    list_display = ("user", "coin_id", "added_at")
    search_fields = ("user__username", "user__email", "coin_id")
    list_filter = ("added_at",)
    
    # Przykładowe dostosowanie wyświetlania w Unfold
    fieldsets = (
        ("Powiązanie Użytkownika", {
            "fields": ("user",)
        }),
        ("Kryptowaluta z CoinGecko", {
            "fields": ("coin_id",)
        }),
    )