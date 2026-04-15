from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import UserWatchlist
from django.contrib.auth.models import Group, User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

admin.site.unregister(Group)
admin.site.unregister(User)

@admin.register(User)
class CustomUserAdmin(BaseUserAdmin, ModelAdmin):  
    def get_actions(self, request):
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions
    
    actions = ["delete_users"]

    @admin.action(description="Usuń użytkownika-ów.")
    def delete_users(self, request, queryset):
        count = queryset.count()
        queryset.delete()
        self.message_user(request, f"Pomyślnie usunięto użytkowników.")    

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